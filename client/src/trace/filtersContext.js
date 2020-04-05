import React, { Component, useContext } from 'react'
import { gql } from 'apollo-boost'

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
    this.setState({ filters })
  }

  setToFrom = ({ to, from }) => {
    this.setState({ to, from })
  }

  toggleVisibility = () => {
    this.setState(({ isVisible }) => ({ isVisible: !isVisible }))
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
