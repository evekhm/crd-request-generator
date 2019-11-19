import React, {Component} from 'react';
import FHIR from "fhirclient"
import {fhir, getAge} from '../../util/fhir';
import './smart.css';
export default class SMARTBox extends Component {
    constructor(props){
        super(props);
        this.state={
            deviceRequest: "none"
        };

        this.handleChange = this.handleChange.bind(this);
    }

    makeOption(request) {
        const a = request.codeCodeableConcept.coding[0].code;
        return <option value={JSON.stringify(request)} key={request.id} label={a}>{a}</option>
    }

    gatherResources() {

    }

    updateValues(patient) {
        this.props.callback("patient", patient);
        this.props.callback("openPatient",false);
        this.props.clearCallback();
        if(this.state.deviceRequest!=="none") {
            const devR = JSON.parse(this.state.deviceRequest);
            this.props.callback("deviceRequest", devR);
            this.props.updateCallback(patient, devR);
            const code = devR.codeCodeableConcept.coding[0].code;
            const system = devR.codeCodeableConcept.coding[0].system;
            let text = "Unknown";
            if(devR.codeCodeableConcept.coding[0].display){
                text = devR.codeCodeableConcept.coding[0].display;
            }
            this.props.callback("code",code);
            this.props.callback("codeSystem", system);
            this.props.callback("display", text);
            if(this.props.options.filter((e)=>{ return e.value===code && e.codeSystem===system }).length===0) {
                this.props.callback("codeValues", [{ key: text, codeSystem: system, value: code }, ...this.props.options])
            }

            if(patient.address && patient.address[0].state) {
                this.props.callback("patientState", patient.address[0].state)
            } else {
                this.props.callback("patientState", "")

            }

            if(devR.performer) {
                if(devR.performer.reference) {
                    fetch(`${this.props.ehrUrl}${devR.performer.reference}`, {
                        method: "GET",
                    }).then(response => {
                        return response.json();
                    }).then(json =>{
                        if(json.address && json.address[0].state) {
                            this.props.callback("practitionerState", json.address[0].state)
                        }else {
                            this.props.callback("practitionerState", "")
                        }

                    });
                }
            } else {
                this.props.callback("practitionerState", "")
            }


        } else { 
            this.props.clearCallback();
        }
    }

    handleChange(e){
        this.setState({deviceRequest:e.target.value});
      }

    render() {
        const patient = this.props.patient;
        const text = "{ }";
        let name = "";
        if(patient.name){
            name = <span> {`${patient.name[0].given[0]} ${patient.name[0].family}`} </span>
        }
        return (
            <div>

                    <div className="patient-selection-box" key={patient.id} onClick={()=>{
                        this.updateValues(patient);
                    }}>
                        <div className="patient-info">
                            <span style={{fontWeight:"bold"}}>ID</span>: {patient.id}
                            {/* <a className="more-info">
                                {text}
                            </a> */}
                            <div><span style={{fontWeight:"bold"}}>Name</span>: {name?name:"N/A"}</div>
                            <div><span style={{fontWeight:"bold"}}>Gender</span>: {patient.gender}</div>
                            <div><span style={{fontWeight:"bold"}}>Age</span>: {getAge(patient.birthDate)}</div>
                        </div>
                        <div className="request-info">
                            <span style={{fontWeight:"bold",marginRight:"5px"}}>Device Request:</span>
                            <select value = {this.state.deviceRequest} onChange={this.handleChange} onClick={(event)=>{event.stopPropagation()}} className="request-selector">
                                {this.props.deviceRequests?
                                    this.props.deviceRequests.data.map((e)=>{return this.makeOption(e)}):null}
                                <option value="none">
                                    None
                                </option>
                            </select>
                        </div>
                    </div>
            </div>




        )
    }
}