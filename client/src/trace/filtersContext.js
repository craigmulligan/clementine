import React, { Component } from 'react'
import logger from 'loglevel'

const FiltersContext = React.createContext()


class FiltersProvider extends Component {
  // Context state
  state = {
    filters: [],
    filterInterval: 'day',
    isVisible: false,
    value: '',
  }

  backUp = () => {
    localStorage.setItem("__filters__", JSON.stringify(this.state));
  }

  processInterval = (filters) => {
      const filter = filters.find(f => f.field === 'interval')

      let value
      if (filter) {
        value = filter.value
      }


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

  // Method to update state
  setFilters = filters => {
    this.setState({ filters }, this.backUp)
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
    const { filters, filterInterval, value } = this.state
    const { setFilters, toggleVisibility, setValue } = this
    const { to, from } = this.processInterval(filters)

    return (
      <FiltersContext.Provider
        value={{
          filters: filters.filter(x => x.field !== 'interval'),
          rawFilters: filters,
          to,
          from,
          toggleVisibility,
          setFilters,
        }}
      >
        {children}
      </FiltersContext.Provider>
    )
  }
}

export { FiltersProvider }

export default FiltersContext
