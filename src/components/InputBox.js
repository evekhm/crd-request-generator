import React, {Component} from 'react';


export default class InputBox extends Component {
    constructor(props){
        super(props);
        this.state={
            value: ""
        };

    this.onInputChange = this.onInputChange.bind(this);

    }
    onInputChange(event){
        this.setState({ value: event.target.value });
        this.props.updateCB(this.props.elementName, event.target.value);

    }
    render() {
        return (
            <div>
            <input
            className={"form-control input-text " + this.props.extraClass}
            name={this.props.elementName}
            value={this.props.value}
            onChange={this.onInputChange}

            ></input>
            </div>
        )
    }
}