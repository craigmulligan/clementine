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

  // Method to update state
  setFilters = filters => {
    this.setState({ filters }, () => {
       localStorage.setItem("__filters__", JSON.stringify(this.state));
    })
  }

  setToFrom = ({ to, from }) => {
    this.setState({ to, from }, () => {
       localStorage.setItem("__filters__", JSON.stringify(this.state));
    })
  }

  toggleVisibility = () => {
    this.setState(({ isVisible }) => ({ isVisible: !isVisible }), () => {
       localStorage.setItem("__filters__", JSON.stringify(this.state));
    })
  }

  componentDidMount = () => {
    try {
      const newState = localStorage.getItem("__filters__")
      const hydratedState = JSON.parse(newState)
      console.log({ hydratedState })
      this.setState(hydratedState)
    } catch (e) {
      console.log(e)
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
