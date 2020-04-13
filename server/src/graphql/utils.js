const decodeCursor = cursor => {
  // returns [ <value>, field, isAsc ]
  if (cursor) {
    return Buffer.from(cursor, 'base64')
      .toString('utf-8')
      .split(':')
  }

  return []
}

const encodeCursor = (o, field, asc) => {
  return Buffer.from(`${o[field]}:${field}:${asc}`).toString('base64')
}

module.exports = {
  Cursor: {
    encode: encodeCursor,
    decode: decodeCursor
  },
}
