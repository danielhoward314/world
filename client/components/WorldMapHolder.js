import React, {Component} from 'react'
import WorldMap from './WorldMap'


class WorldMapHolder extends Component {
  constructor(props) {
    super(props)

    this.state = {
      width: "100vw",
      height: "100vh"
    }
  }
  render() {
    return (
      <div ref="anchor" id="map-holder"
      style={{width: this.state.width, height: this.state.height}}
      >
        <WorldMap width={this.state.width} height={this.state.height} />
      </div>
    )
  }
}

export default WorldMapHolder
