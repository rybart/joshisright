import React, { Component } from 'react';
import '../App.css';
import axios from 'axios';
import {Link} from 'react-router-dom';
import homeIcon from '../home.png';
import profileIcon from '../profile.png';
import add from '../add.png.png';
import {connect} from 'react-redux';


class Header extends Component {
  constructor(props){
    super(props);
    this.state = {
      display: 'none',
      passwordDisplay: 'none',      
    }
    this.showOptions = this.showOptions.bind(this);
    
  }
  showOptions(){
    if(this.state.display === 'none'){
      this.setState({
        display:'flex',
      })
    }else{
      this.setState({
        display:'none',
      })
    }
  }
  render() {
    if(this.props.user.user_type === 'Admin'){
        return(
          <div className="Header">
          <Link to='/dashboard'>
            <img src={homeIcon} alt="Home" className="homeIcon"/>
          </Link>
          <div className="rightSide">
            <img src={add} alt="" className="add"/>
            <img src={profileIcon} alt="Profile" className="profileIcon" onClick = {this.showOptions}/>
            <div className="userOptions" style={{display:this.state.display}}>
              <h3 className="option" >Change Password</h3>
              <Link to='/'>
                <h3 className="option" >Logout</h3>
              </Link>
            </div>
          </div>
        </div>
        )
      }
      return (
        <div className="Header">
          <Link to='/dashboard'>
            <img src={homeIcon} alt="Home" className="homeIcon"/>
          </Link>
          <img src={profileIcon} alt="Profile" className="profileIcon" onClick = {this.showOptions}/>
          <div className="userOptions" style={{display:this.state.display}}>
            <h3 className="option" >Change Password</h3>
            <Link to='/'>
              <h3 className="option" >Logout</h3>
            </Link>
          </div>
        </div>
      );
    }
  }

  export default connect((state) => state)(Header);
