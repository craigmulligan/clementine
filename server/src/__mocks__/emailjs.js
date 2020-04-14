const mockSend = (args, cb) => {
  console.log('SENT')
  cb()
}

module.exports = {
  server: {
    connect: () => ({
      send: mockSend
    })
  }
}
