import React, { Fragment } from 'react'
import Pill from '../pill'

export default function OrderBy({
  fields,
  orderAsc,
  setOrderAsc,
  setOrderField,
  orderField
}) {
  const symbol = orderAsc
    ? String.fromCharCode(9652)
    : String.fromCharCode(9662)

  return (
    <Fragment>
      {fields.map(({ field, label }) => {
        return (
          <Pill
            isActive={orderField === field}
            onClick={() => {
              if (orderField === field) {
                setOrderAsc(prev => !prev)
              }
              setOrderField(field)
            }}
          >
            {label} {orderField === field && symbol}
          </Pill>
        )
      })}
    </Fragment>
  )
}
