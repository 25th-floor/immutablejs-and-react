import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';

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
    render() {
        let classes = ['col', this.props.active ? 'checked' : false].filter(_.identity).join(' ');
        return (
            <div className={classes} onClick={this.props.toggle}></div>
        );
    }
}

class Row extends React.Component {
    renderColumn(col, index) {
        return <Column key={col.id}
                       active={col.active}
                       toggle={this.props.toggle.bind(this, index)}/>
    }

    render() {
        return <div className="row">{this.props.cols.map(this.renderColumn.bind(this))}</div>;
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            rows: grid(20)
        };
    }

    toggle(row, col) {
        this.state.rows[row].cols[col].active = !this.state.rows[row].cols[col].active;
        this.forceUpdate();
    }

    changeSize(e) {
        let size = Math.min(parseInt(e.target.value, 10), 400);
        this.setState({
            rows: grid(size)
        });
    }

    renderRow(row, index) {
        return <Row cols={row.cols}
                    key={row.id}
                    toggle={this.toggle.bind(this, index)}/>;
    }

    render() {
        return (
            <div>
                <input type="number" value={this.state.rows.length} onChange={this.changeSize.bind(this)}/>
                <div>{this.state.rows.map(this.renderRow.bind(this))}</div>
            </div>
        );
    }

}

ReactDOM.render(<App/>, window.mountNode);
