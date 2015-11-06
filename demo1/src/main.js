import _ from 'lodash';
import Immutable from 'immutable';
import React from 'react';
import ReactDOM from 'react-dom';

import * as transit from './transit';

function grid(n) {
    return _.range(0, n).map(row => ({
        id: row,
        cols: _.range(0, n).map(col => ({
            id: col,
            active: false
        }))
    }));
}

class Column extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        return this.props.active !== nextProps.active;
    }

    render() {
        let classes = ['col', this.props.active ? 'checked' : false].filter(_.identity).join(' ');
        return (
            <div className={classes} onClick={this.props.toggle}></div>
        );
    }
}

class Row extends React.Component {
    renderColumn(col, index) {
        return <Column key={col.get('id')}
                       active={col.get('active')}
                       toggle={this.props.toggle.bind(this, index)}/>
    }

    shouldComponentUpdate(nextProps, nextState) {
      return !Immutable.is(this.props.cols, nextProps.cols);
    }

    render() {
        return <div className="row">{this.props.cols.map(this.renderColumn.bind(this))}</div>;
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this._json = null;
        this._snapshots = null;
        this.state = {
            rows: Immutable.fromJS(grid(20)),
            snapshots: Object.keys(localStorage),
            view: 'grid',
            history: Immutable.List(),
            future: Immutable.List()
        };
    }

    toggle(row, col) {
        let nextRows = this.state.rows.updateIn([row, 'cols', col, 'active'], active => !active);
        this.setState({
            rows: nextRows,
            history: this.state.history.push(this.state.rows),
            future: Immutable.List()
        });
    }

    changeSize(e) {
      let size = Math.min(parseInt(e.target.value, 10), 400);
      this.setState({
        rows: Immutable.fromJS(grid(size)),
        history: Immutable.List(),
        future: Immutable.List()
      });
    }

    undo() {
      this.setState({
        rows: this.state.history.last(),
        history: this.state.history.pop(),
        future: this.state.future.push(this.state.rows)
      });
    }

    redo() {
      this.setState({
        rows: this.state.future.last(),
        future: this.state.future.pop(),
        history: this.state.history.push(this.state.rows)
      });
    }

    activateView(what) {
        this.setState({view: what});
    }

    restoreFromJson() {
        try {
            let data = transit.reader.read(this._json.value);
            this.setState({
                rows: data.get('rows'),
                history: data.get('history'),
                future: data.get('future'),
                view: 'grid'
            });
        } catch (err) {
            console.warn('malformed json', err);
        }
    }

    snapshot() {
      let title = window.prompt('Enter Snapshot Title') || '';
      if (title.trim()) {
        let {rows, history, future} = this.state;
        localStorage.setItem(title.trim(), transit.writer.write({rows, history, future}));
      }
      this.setState({snapshots: Object.keys(localStorage)});
    }

    restoreSnapshot() {
      let data = transit.reader.read(localStorage.getItem(this._snapshots.value));
      this.setState({
          rows: data.get('rows'),
          history: data.get('history'),
          future: data.get('future'),
          view: 'grid'
      });
    }

    replayFuture() {
      var interval = setInterval(() => {
        if (this.state.future.size > 0) {
          this.redo();
        } else {
          clearInterval(interval);
        }
      }, 100);
    }

    renderRow(row, index) {
        return <Row cols={row.get('cols')}
                    key={row.get('id')}
                    toggle={this.toggle.bind(this, index)}/>;
    }

    renderGrid() {
        return (
            <div>
                <input type="number" value={this.state.rows.size} onChange={this.changeSize.bind(this)}/>
                <button onClick={this.undo.bind(this)} disabled={this.state.history.size < 1}>Undo</button>
                <button onClick={this.redo.bind(this)} disabled={this.state.future.size < 1}>Redo</button>
                <button onClick={this.snapshot.bind(this)}>Snapshot</button>
                <select ref={elem => this._snapshots = elem}>
                  {Object.keys(localStorage).map(k => <option key={k}>{k}</option>)}
                </select>
                <button onClick={this.restoreSnapshot.bind(this)}>Restore Snapshot</button>
                <button onClick={this.replayFuture.bind(this)}>Back to the Future</button>
                <div>{this.state.rows.map(this.renderRow.bind(this))}</div>
            </div>
        );
    }

    renderJson() {

        let transitJson = transit.writer.write({
            rows: this.state.rows,
            history: this.state.history,
            future: this.state.future
        });

        return (
            <div>
                <textarea rows={30}
                          cols={150}
                          autoComplete="off"
                          spellCheck="false"
                          defaultValue={transitJson}
                          ref={elem => this._json = elem}/>
                <br/>
                <button onClick={this.restoreFromJson.bind(this)}>Restore</button>
            </div>
        );
    }

    render() {
        return (
            <div>
                <ul className="tabs">
                    <li><a href="#" onClick={this.activateView.bind(this, 'grid')}>Grid</a></li>
                    <li><a href="#" onClick={this.activateView.bind(this, 'json')}>JSON</a></li>
                </ul>
                <div style={{clear:'both'}}/>

                {this.state.view == 'grid' ? this.renderGrid() : this.renderJson()}
            </div>
        );
    }
}

ReactDOM.render(<App/>, window.mountNode);
