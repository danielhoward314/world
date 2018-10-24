import React, {Component} from 'react'
import * as d3 from 'd3'
import {employees} from '../../public/seed'


class WorldMap extends Component {
  constructor(props) {
    super(props)
    this.state = {
      w: 3000,
      h: 1500,
      refMounted: false,
      visitedCountries: [],
      country: '',
      emplByCountry: []
    }
    this.minZoom = null
    this.maxZoom = null
    this.zoomed = this.zoomed.bind(this)
    this.initiateZoom = this.initiateZoom.bind(this)
    this.getTextBox = this.getTextBox.bind(this)
    this.path = this.path.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  componentDidUpdate() {
    d3.zoom().on("zoom", this.zoomed)
  }

  handleChange(event) {
    let targProp = event.target.name
    let targVal = event.target.value
    this.setState((state) => {
      return {[targProp]: targVal}
    })
  }

  handleSubmit(event) {
    event.preventDefault()
    const emplByCountry = employees.filter((employee) => {
      return employee.country === this.state.country
    })
    this.setState((state) => {
      return {...state, emplByCountry}
    })
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
          .on("click", (d) => {
            this.setState((prevState) =>
              ({ visitedCountries: [...prevState.visitedCountries, {
                name: d.properties.name,
                population: d.properties.pop_est
              }] })
              )
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
    console.log(this.state)
    console.log(employees)
      return (
        <div>
          <div id="user-info">
            <h1>Welcome to the world map, click to get data for countries you've visited</h1>
            <form onSubmit={ this.handleSubmit }>
              <label> Country:
                <input type="text" name="country" value={ this.state.country } onChange={this.handleChange} />
              </label>
              <button type="submit">Search Employee By Country</button>
            </form>
            {this.state.visitedCountries.length ? <ul>{this.state.visitedCountries.map((country, idx) => {
              return (<li key={idx}>{country.name}
                      <ul><li>Population: {country.population}</li></ul>
                      </li>)
            })}</ul> : null}
            {this.state.emplByCountry.length ? <ul>{this.state.emplByCountry.map((employee, idx) => {
              return (<li key={idx}>{employee.full_name}</li>)
            })}</ul> : null}
          </div>
          <svg id="map-svg" style={{width: (this.props.width),
        height: (this.props.height),
        color: "rgba(0,0,0,0)"}}>
          <g id="map">
            <rect id="map-rect" x={0} y={0} width={this.state.w} height={this.state.h} />
          </g>
        </svg>
        </div>
      )
  }
}


export default WorldMap
