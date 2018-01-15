import React, { Component } from 'react';
import { connect } from 'react-redux'
import './FileList.css'
import { List } from 'react-virtualized';
let Dropbox = require('dropbox');

function mapStateToProps(state) {
  let {dropbox_api} = state;
  return { dropbox_api };
}

let FileList = connect(mapStateToProps)(class extends Component {
  constructor(props) {
    super(props);
    this.state = {files: []}
  }
  getRoWRenderer() {
    let files = this.state.files;
    return function rowRenderer({
      key,         // Unique key within array of rows
      index,       // Index of row within collection
      isScrolling, // The List is currently being scrolled
      isVisible,   // This row is visible within the List (eg it is not an overscanned row)
      style        // Style object to be applied to row (to position it)
    }) {
      return (
        <div key={key} style={style} className="fileItem">
          {files[index].name}
        </div>
      )
    }
  }
  render() {
    let renderedFiles = ""
    // let renderedFiles = this.state.files.map(file => 
    //   <div class="item">
    //     {file.name}
    //   </div>
    // )
    return (
      <div>
        file list here 
        <div>
          {this.props.dropbox_api.access_token}
        </div>
        <div>
          <List
            width={300}
            height={300}
            rowCount={this.state.files.length}
            rowHeight={50}
            rowRenderer={this.getRoWRenderer()}
          />,

          {renderedFiles}
        </div>
      </div>
    );
  }
  componentDidMount() {
    this.updateFileList()
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.props.dropbox_api !== prevProps.dropbox_api) {
      this.updateFileList();
    }
  }
  updateFileList() {
    console.log('updateFileList()');
    if (!this.props.dropbox_api) {
      return;
    }
    let dropbox = new Dropbox({accessToken: this.props.dropbox_api.access_token});
    dropbox.filesListFolder({path: '/vim-notes'}).then(({entries}) => {
      console.log(entries);
      this.setState({
        files: entries
      });
    }).catch(function(error) {
      console.log(error);
    });
  }
});

export default FileList;
