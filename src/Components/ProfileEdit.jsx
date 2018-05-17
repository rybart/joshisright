import React, { Component } from 'react';
import '../App.css';
import axios from 'axios';
import Header from './Header.jsx';
import * as Actions from '../Redux/Actions/action'

import {getUser} from '../Redux/Actions/action';
import {connect} from 'react-redux';

class ProfileEdit extends Component {
    constructor(props){
        super(props)
        this.state = {
          first_name:'',
          last_name:'',
          email:'',
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
      }else{
        this.setState({
          first_name:this.props.user.first_name,
          last_name:this.props.user.last_name,
          email:this.props.user.email,
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
      axios.put(`/api/user`, {first_name:this.state.first_name, last_name:this.state.last_name, email:this.state.email, user_id:this.props.user.user_id})
      .then(response => {
      this.props.history.push('/dashboard');
      })
      .catch(err => {
        console.log(err);
      })
    }
  render() {
    return (
      <div className="ProfileEdit">
        <Header/>
        <div className="fields">
          <form onSubmit={(event)=>{this.save(event)}} className="newTile">
            <input autofocus='true' type="text" placeholder='First Name' name='first_name' value = {this.state.first_name} onChange={this.handleChange} className="newInput first_name"/>
            <br/>
            <input type="text" placeholder='Last Name' name='last_name' value = {this.state.last_name} onChange={this.handleChange} className="newInput last_name"/>
            <br/>
            <input type='text' placeholder='Email' name='email' value = {this.state.email} onChange={this.handleChange} className="newInput email"/>
            <br/>            
            <input type="submit" onClick={this.save} className="save"/>
          </form>
        </div>
      </div>
    );
  };

}

export default connect((state) => state, Actions)(ProfileEdit);
