const mockSend = (args, cb) => {
  cb()
}

module.exports = {
  server: {
    connect: () => ({
      send: mockSend
    })
  }
}
