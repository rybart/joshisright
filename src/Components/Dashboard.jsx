import React, {
  Component
} from 'react';
import '../App.css';
import axios from 'axios';
import * as Actions from '../Redux/Actions/action'
import {
  getUser
} from '../Redux/Actions/action';
import {
  connect
} from 'react-redux';

import Header from './Header.jsx'

class Dashboard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      display: 'All',
      tiles: [],
      type: '',
    }
    this.handleChange = this.handleChange.bind(this);
    this.deleteTile = this.deleteTile.bind(this);
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }
  deleteTile(id) {
    axios.delete(`/api/delete/${id}`)
      .then(() => {
        window.location.reload()
      })
      .catch(err => {
        console.error(err)
      })
  }
  componentWillMount() {
    if (!this.props.user.id) {
      this.props.getUser()
        .then(() => {
          axios.get(`/api/dashboard/${this.state.display}`)
            .then(response => {
              this.setState({
                type: this.props.user.user_type,
                tiles: response.data,
              })
            })
            .catch(err => {
              console.error(err);
            })
        })
        .catch(err => {
          console.error(err);
          this.props.history.push('/');
        })
    } else {
      axios.get(`/api/dashboard/${this.state.display}`)
        .then(response => {
          this.setState({
            type: this.props.user.user_type,
            tiles: response.data,
          })
        })
        .catch(err => {
          console.error(err);
        })
    }
  }
  render() {
    let tiles = ''
    if (this.state.tiles.length > 0) {
      if (this.props.user.user_type === 'Admin') {
        tiles = this.state.tiles.map(tiles => {
          return ( <div className = 'tile' >
            <button className = "delete"
            onClick = {
              () => this.deleteTile(tiles.id)
            } > X 
            </button> <h1 className = 'tileTitle' > {
              tiles.title
            } 
            </h1> <a href = {
              tiles.ref
            } >
            View </a> 
            </div > )
        })
      } else {
        tiles = this.state.tiles.map(tiles => {
          return ( <div className = 'tile'
            key = {
              tiles.id
            } >
            <h1 className = 'tileTitle'> {
              tiles.title
            } </h1> 
            <a ref = {tiles.ref}>
            View
            </a> 
            </div > )
        })
      }
    } else {
      return ( 
      <div className = "loading" >
        Loading 
        </div>)
      }
      return ( 
        <div className = "Dashboard" >
        <Header />
        <div className = "tilesContatiner" >
         {tiles} 
         </div> 
         </div >
      );
    }
  }

  export default connect((state) => state, Actions)(Dashboard);