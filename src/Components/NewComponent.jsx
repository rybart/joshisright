import React, { Component } from 'react';
import '../App.css';
import axios from 'axios';
import Header from './Header.jsx';
import * as Actions from '../Redux/Actions/action'

import {getUser} from '../Redux/Actions/action';
import {connect} from 'react-redux';

class NewComponent extends Component {
    constructor(props){
        super(props)
        this.state = {
          title:'',
          img:'',
          ref:'',
          notes:'',
          tag:'',
          status:'',
        }
        this.handleChange = this.handleChange.bind(this);
        this.save = this.save.bind(this);
        
    }
    componentWillMount() {
      if (!this.props.user.id) {
        this.props.getUser()
          .catch(err => {
            console.error(err);
            this.props.history.push('/');
          })
      } 
    }
    handleChange(e){
        this.setState({
            [e.target.name]: e.target.value,
        });
    }
    save(e){
      e.preventDefault()
      axios.post(`/api/save`, {title:this.state.title, img:this.state.img, ref:this.state.ref, notes:this.state.notes, tags:this.state.tag, status:'Active'})
      .then(response => {
        debugger
      this.props.history.push('/dashboard');
      })
      .catch(err => {
        debugger
        console.log(err);
      })
    }
  render() {
    return (
      <div className="NewComponent">
        <Header/>
        <div className="fields">
          <div className = 'image' height='400px' width='400px'>
            <img src={this.state.img} alt="Preview of Image" className="display"/>
          </div>
          <form onSubmit={(event)=>{this.save(event)}} className="newTile">
            <input autofocus='true' type="text" placeholder='Title' name='title' value = {this.state.title} onChange={this.handleChange} className="newInput title"/>
            <br/>
            <input type="text" placeholder='Image' name='img' value = {this.state.img} onChange={this.handleChange} className="newInput img"/>
            <br/>
            <input type='text' placeholder='URL' name='ref' value = {this.state.ref} onChange={this.handleChange} className="newInput ref"/>
            <br/>            
            <textarea type="text" placeholder='Notes' name='notes' value = {this.state.notes} onChange={this.handleChange} className="notes"/>
            <br/>            
            <input type="text" placeholder='Tag' name='tag' value = {this.state.tag} onChange={this.handleChange} className="newInput tag"/>
            <br/>            
            <input type="submit" onClick={this.save} className="save"/>
          </form>
        </div>
      </div>
    );
  };

}

export default connect((state) => state, Actions)(NewComponent);
