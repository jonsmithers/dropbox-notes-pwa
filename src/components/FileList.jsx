import React, { Component } from 'react';
import { connect } from 'react-redux'

function mapStateToProps(state) {
  return {};
}

let FileList = connect(mapStateToProps)(class extends Component {
  render() {
    return (
      <div>
        file list here 
      </div>
    );
  };
});

export default FileList;
