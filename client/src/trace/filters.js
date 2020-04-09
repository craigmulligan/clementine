import React, { useContext, useState, useEffect } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { Loading, ErrorBanner } from '../utils'
import VisualFilter from 'react-visual-filter'
import styles from './filters.module.css'
import FiltersContext from './filtersContext'

const TRACE_FILTER_OPTIONS = gql`
  query traceFilterOptions($graphId: ID!) {
    traceFilterOptions(graphId: $graphId) {
      clientName
      clientVersion
      schemaTag
    }
  }
`

const autoComplete = ({ setSuggestions, fields, trigger }) => value => {
  const matches = value.match(/\w+:?(\S*)?/g)
  if (matches) {
    const lastMatch = matches.pop()
    if (!lastMatch.includes(trigger)) {
      setSuggestions(fields.map(x => x.label).filter(x => x.startsWith(lastMatch)))
    } else {
      const [fieldLabel, valueName] = lastMatch.split(':')
      const field = fields.find(f => f.label === fieldLabel)
      if (field) {
        const isComplete =  field.values.map(x => x.label).find(x => {
          return x === valueName
        })

        if (isComplete) {
          setSuggestions(fields.map(x => x.label))
        } else {
          setSuggestions(field.values.map(x => x.label).filter(x => {
            return x.startsWith(valueName)
          }))
        }
      }
    }
  } else {
    setSuggestions(fields.map(x => x.label))
  }
}


export default function TraceFilters({ graphId, onChange }) {
  const {
    conditions,
    setFilters,
    setFilterInterval,
    filterInterval
  } = useContext(FiltersContext)
  const [suggestions, setSuggestions] = useState([])
  const [value, setValue] = useState('')
  const { loading, error, data } = useQuery(TRACE_FILTER_OPTIONS, {
    variables: {
      graphId
    }
  })

  if (loading) return <Loading />
  if (error) return <ErrorBanner error={error} />

    const intervalField = {
      name: 'interval', label: 'last', values: [{
        name: 'hour',
        label: 'hour'
      }, {
        name: 'day',
        label: 'day'
      }, {
        name: 'month',
        label: 'month'
      }]
    }

  // Todo we should just have an arbitrary way to select to - from.
  const apiFields = Object.entries(data.traceFilterOptions)
    .filter(([k, v]) => {
      if (k === '__typename') {
        return false
      }
      return true
    })
    .map(([k, v]) => {
      return {
        label: k,
        name: k,
        values: v
          ? v
              .filter(v => !!v)
              .map(v => ({
                name: v,
                label: v
              }))
          : []
      }
    })


  const fields = [intervalField, ...apiFields]
  const trigger = ':'
  const completer = autoComplete({ setSuggestions, fields, trigger })

  return (
    <div className={styles.wrapper}>
    <div><textarea type="text" value={value} onChange={(evt) => {
      setValue(evt.target.value)
      completer(evt.target.value)
    }} /></div>
      <div className={styles.suggestions}>{
      suggestions.map((suggestion) => {
        return (<div className={styles.suggestion} onClick={() => {
        const trigger = ':'
        let v
        const matches = value.match(/\w+:?(\S*)?/g)
          if (matches) {
            // TODO double selecting suggestion there is a bug.
            const lastMatch = matches.pop()
            if (lastMatch.includes(trigger)) {
              const [fieldLabel, valueName] = lastMatch.split(':')
              const field = fields.find(f => f.label === fieldLabel)

              if (field) {
                const isComplete =  field.values.map(x => x.label).find(x => {
                  return x === valueName
                })
                if (isComplete) {
                  // full match move on to next field
                  v = [...matches, lastMatch, suggestion + ":"].join(' ')
                } else {
                  // not full match replace suggesion
                  v = [...matches, fieldLabel +  ":" + suggestion + " "].join(' ')
                }
              }

            } else {
              v = [matches, suggestion + ":"].join(' ')
            }
          } else {
            v = suggestion
          }

          setValue(v)
          completer(v)
        }} key={suggestion}>{suggestion}</div>)
      })
      }</div>
    </div>
  )
}
