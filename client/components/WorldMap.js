import React, {Component} from 'react'
import * as d3 from 'd3'


class WorldMap extends Component {
  constructor(props) {
    super(props)
    this.state = {
      w: 3000,
      h: 1250,
      refMounted: false
    }
    this.minZoom = null
    this.maxZoom = null
    // this.zoom = this.zoom.bind(this)
    this.zoomed = this.zoomed.bind(this)
    this.initiateZoom = this.initiateZoom.bind(this)
    this.getTextBox = this.getTextBox.bind(this)
    this.path = this.path.bind(this)
  }

  componentWillMount() {
    d3.json(
      "topo", function(json) {
        console.log(json.features)
        // draw a path for each feature/country
        // const countries = d3.select("#map")
        //   .selectAll("path")
        //   .data(json.features)
        //   .enter()
        //   .append("path")
        //   .attr("d", (d, i) => {
        //     console.log(d)
        //     return this.path(d)
        //   })
        //   .attr("id", function(d, i) {
        //     console.log(`here's the d: ${d}`)
        //     return "country" + d.properties.iso_a3;
        //   })
        //   .attr("class", "country")
      }
    )
  }

  componentDidUpdate() {
    d3.zoom().on("zoom", this.zoomed)
  }

  // Create function to apply zoom to countriesGroup
  zoomed() {
    let t = d3
      .event
      .transform

    d3.select("#map")
      .attr("transform","translate(" + [t.x, t.y] + ")scale(" + t.k + ")")

  }

   // Function that calculates zoom/pan limits and sets zoom to default value
   initiateZoom() {
    // Define a "minzoom" whereby the "Countries" is as small possible without leaving white space at top/bottom or sides
    this.minZoom = Math.max(window.innerWidth / this.state.w, (window.innerHeight - 158) / this.state.h)
    // set max zoom to a suitable factor of this value
    this.maxZoom = 20 * this.minZoom
    // set extent of zoom to chosen values
    // set translate extent so that panning can't cause map to move out of viewport
    d3.zoom()
      .scaleExtent([this.minZoom, this.maxZoom])
      .translateExtent([[0, 0], [this.state.w, this.state.h]])

    // define X and Y offset for centre of map to be shown in centre of holder
    let midX = (window.innerWidth - this.minZoom * this.state.w) / 2
    let midY = ((window.innerHeight - 158) - this.minZoom * this.state.h) / 2
    // change zoom transform to min zoom and centre offsets
    d3.select("#map-svg").call(d3.zoom().on("zoom", this.zoomed).transform, d3.zoomIdentity.translate(midX, midY).scale(this.minZoom))
  }

  path(data) {
    let projection = d3.geoEquirectangular()
    let geoGenerator = d3.geoPath()
    .projection(projection)
    return geoGenerator(data)
  }

  getTextBox(selection) {
    selection
      .each(function(d) {
        d.bbox = this
          .getBBox()
        })
  }

  componentDidMount() {
    if(this.refs.anchor && !this.state.refMounted) {
      this.setState({refMounted: true})
    }
    this.initiateZoom()

    // zoom to show a bounding box, with optional additional padding as percentage of box size
    function boxZoom(box, centroid, paddingPerc) {
      let minXY = box[0]
      let maxXY = box[1]
      // find size of map area defined
      let zoomWidth = Math.abs(minXY[0] - maxXY[0])
      let zoomHeight = Math.abs(minXY[1] - maxXY[1])
      // find midpoint of map area defined
      let zoomMidX = centroid[0]
      let zoomMidY = centroid[1]
      // increase map area to include padding
      zoomWidth = zoomWidth * (1 + paddingPerc / 100)
      zoomHeight = zoomHeight * (1 + paddingPerc / 100)
      // find scale required for area to fill svg
      let maxXscale = d3.select("svg").style("width") / zoomWidth
      let maxYscale = d3.select("svg").style("height") / zoomHeight
      let zoomScale = Math.min(maxXscale, maxYscale)
      // handle some edge cases
      // limit to max zoom (handles tiny countries)
      zoomScale = Math.min(zoomScale, this.maxZoom)
      // limit to min zoom (handles large countries and countries that span the date line)
      zoomScale = Math.max(zoomScale, this.minZoom)
      // Find screen pixel equivalent once scaled
      let offsetX = zoomScale * zoomMidX
      let offsetY = zoomScale * zoomMidY
      // Find offset to centre, making sure no gap at left or top of holder
      let dleft = Math.min(0, d3.select("svg").style("width") / 2 - offsetX)
      let dtop = Math.min(0, d3.select("svg").style("height") / 2 - offsetY)
      // Make sure no gap at bottom or right of holder
      dleft = Math.max(d3.select("svg").style("width") - this.state.w * zoomScale, dleft)
      dtop = Math.max(d3.select("svg").style("height") - this.state.h * zoomScale, dtop)
      // set zoom
      d3.select("map-holder")
        .transition()
        .duration(500)
        .call(
          d3.zoom().on("zoom", this.zoomed).transform,
          d3.zoomIdentity.translate(dleft, dtop).scale(zoomScale)
        )
    }

    d3.select(window).on("resize",() => {
      d3.select("#map-holder")
        .attr("width", d3.select("#map-holder").style("width"))
        .attr("height", d3.select("#map-holder").style("height"))

      this.initiateZoom()
    })

  }

  render() {
      return (
        <svg id="map-svg" style={{width: (this.props.width),
        height: (this.props.height),
        color: "rgba(0,0,0,0)"}}>
          <g id="map"
          // transform="translate(-132.092, 1.42109e-14) scale(1.9384, 1.9384)"
          >
            <rect id="map-rect" x={0} y={0} width={this.state.w} height={this.state.h}></rect>
            {/* {data.map((feature) => {
              console.log(feature)
              return <path className="country" id={"country" + feature.properties.iso_a3}
              d={this.path(feature)}/>
            })} */}
          </g>
        </svg>
      )
  }
}


export default WorldMap
