import React, { Component } from 'react'
import logger from 'loglevel'

const FiltersContext = React.createContext()


class FiltersProvider extends Component {
  // Context state
  state = {
    filters: [],
    filterInterval: 'day',
    isVisible: false,
  }

  backUp = () => {
    localStorage.setItem("__filters__", JSON.stringify(this.state));
  }

  processInterval = (value) => {
      let from
      const to = Date.now()
      if (value === 'hour') {
        from = to - (1000 * 60 * 60)
      }

      if (value === 'day') {
        from = to - (1000 * 60 * 60 * 24)
      }

      if (value === 'month') {
        from = to - (1000 * 60 * 60 * 24 * 30)
      }

      return { to, from }
  }

  cleanFilters = (data) => {
    return data.map(f => ({
      value: f.value,
      field: f.field,
      operator: f.operator
    }))
  }

  // Method to update state
  setFilters = filters => {
    this.setState({ filters }, this.backUp)
  }

  setFilterInterval = (filterInterval) => {
    this.setState({ filterInterval }, this.backUp)
  }

  toggleVisibility = () => {
    this.setState(({ isVisible }) => ({ isVisible: !isVisible }), this.backUp)
  }

  componentDidMount = () => {
    try {
      const newState = localStorage.getItem("__filters__")
      const hydratedState = JSON.parse(newState)
      this.setState(hydratedState)
    } catch (e) {
      logger.warn("Could not parse saved filters")
    }
  }

  render() {
    const { children } = this.props
    const { filters, filterInterval } = this.state
    const { setFilters, toggleVisibility, setFilterInterval } = this
    const { to, from } = this.processInterval(filterInterval)

    return (
      <FiltersContext.Provider
        value={{
          filters: this.cleanFilters(filters),
          to,
          from,
          toggleVisibility,
          setFilters,
          setFilterInterval,
          filterInterval,
          conditions: filters
        }}
      >
        {children}
      </FiltersContext.Provider>
    )
  }
}

export { FiltersProvider }

export default FiltersContext
