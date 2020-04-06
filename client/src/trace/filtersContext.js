import React, { Component, useContext } from 'react'
import { gql } from 'apollo-boost'
import logger from 'loglevel'

const FiltersContext = React.createContext()


class FiltersProvider extends Component {
  // Context state
  state = {
    filters: [],
    to: Date.now(),
    from: Date.now() - 86400000,
    isVisible: false,
  }

  backUp = () => {
    localStorage.setItem("__filters__", JSON.stringify(this.state));
  }

  // Method to update state
  setFilters = filters => {
    this.setState({ filters }, this.backUp)
  }

  setToFrom = ([ to, from ]) => {
    this.setState({ to, from }, this.backUp)
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
    const { filters, to, from } = this.state
    const { setFilters, setToFrom, toggleVisibility } = this

    return (
      <FiltersContext.Provider
        value={{
          filters,
          to,
          from,
          toggleVisibility,
          setFilters,
          setToFrom,
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
