import React, {Component} from 'react'
import * as d3 from 'd3'


class WorldMap extends Component {
  constructor(props) {
    super(props)
    this.state = {
      w: 3000,
      h: 1500,
      refMounted: false
    }
    this.minZoom = null
    this.maxZoom = null
    this.zoomed = this.zoomed.bind(this)
    this.initiateZoom = this.initiateZoom.bind(this)
    this.getTextBox = this.getTextBox.bind(this)
    this.path = this.path.bind(this)
  }

  componentDidUpdate() {
    d3.zoom().on("zoom", this.zoomed)
  }

  // Create function to apply zoom to <g> (group of country paths)
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
    .center([0, 15]) // setting center further north
    .scale([this.state.w/(2*Math.PI)]) // scale to fit group width
    .translate([this.state.w/2,this.state.h/2]) // ensure centred in group
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

    d3.json(
      "https://raw.githubusercontent.com/danielhoward314/world/master/public/custom.geo.json"
    ).then((data) => {
        d3.select("#map")
          .selectAll("path")
          .data(data.features)
          .enter()
          .append("path")
          .attr("d", this.path)
          .attr("id", function(d) {
            return "country" + d.properties.iso_a3;
          })
          .attr("class", "country")
          .on("mouseover", function(d, i) {
            d3.select("#countryLabel" + d.properties.iso_a3).style("display", "block");
        })
        .on("mouseout", function(d, i) {
            d3.select("#countryLabel" + d.properties.iso_a3).style("display", "none");
        })
        // add an onclick action to zoom into clicked country
        .on("click", function(d, i) {
            d3.selectAll(".country").classed("country-on", false);
            d3.select(this).classed("country-on", true);
        })
    })

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
          <g id="map">
            <rect id="map-rect" x={0} y={0} width={this.state.w} height={this.state.h} />
          </g>
        </svg>
      )
  }
}


export default WorldMap
