SoundsControllers = angular.module("SoundsControllers", [])
class SoundsCtrl 
  
  constructor: (@scope, @http, @location, @filter, @Sound) ->

    @scope.showsearch = true

    @bubbleSort = (array) ->
      next2last = array.length - 1
      holder = undefined
      swapOccured = undefined
      index = undefined
      nextIndex = undefined
      array.some ->
        swapOccured = false
        index = 0
        while index < next2last
          nextIndex = index + 1
          console.log(array[index])
          console.log(array[nextIndex])
          if array[index][1][0].count > array[nextIndex][1][0]
            holder = array[nextIndex]
            array[nextIndex] = array[index]
            array[index] = holder
            swapOccured = true
          index += 1
        return true  unless swapOccured
        false

      return

    orderBy = @filter('orderBy')
    @user = ""
    @tracks = {}
    @tracks.soundcloud = []
    @songs = []
    @http.get('api/users').success (data) =>
      @users = data
      @songs = data.queue
      if data.session
        @user = data.session
        @scope.signup = true
        @scope.loginshow = false
        @scope.logoutbutton = true

        for song in @songs
          for vote in song[1]
            if vote.uservote == @user.id
              song[0].voted = true

      else
        @guestuser = true
        @scope.showsearch = false
      
      @songs.sort (a, b) =>
        return 1  if a[1][0].count < b[1][0].count
        return -1  if a[1][0].count > b[1][0].count
        return 1  if a[1][0].createdAt > b[1][0].createdAt
        return 1 if a[1][0].createdAt < b[1][0].createdAt
        0

      console.log(@songs)

  searchSongs: (query) ->
    thisQuery = query
    @scope.query = {}
    @tracks = {}
    @tracks.soundcloud = []
    @http.post('api/soundcloud', {query: query.string}).success (data) =>

      for track in data
        if track.streamable == true
          @tracks.soundcloud.push(track)



      @http.post('api/spotify', {query: query.string, limiter: @tracks.soundcloud.length}).success (data) =>
        @tracks.spotify = data

        count = 0
        for track in @tracks.spotify.tracks.items
          track.streamUrl = @tracks.soundcloud[count].permalink_url
          track.soundcloudtitle = @tracks.soundcloud[count].title

          console.log(track.soundcloudtitle)
          count += 1


        @scope.clicked = false

  searchLiveBands: (track) ->
    @scope.clicked = true
    @newQueue = {}
    @newVote = {}
    @http.post("api/users/#{@user.id}/songs", {title: track.name, artist: track.artists[0].name, image: track.album.images[2].url, playthrough: false, url: track.streamUrl}).success (data) =>
      @newQueue = data.queue
      @newVote = data.vote
      @http.post('api/searchlivebands', {track: track.artists[0].name}).success (data) =>
        for listing in data
          @http.post("api/songs/#{@newQueue.id}/venues", {venuename: listing.formatted_location + " **AT** " + listing.venue.name, venuedate: listing.formatted_datetime, rsvp: listing.facebook_rsvp_url})

      @songs.push([@newQueue, [@newVote]])

  deleteQueueItem: (queueItem) ->
    console.log('in here')
    console.log("songs", @songs[0])
    @http.delete("api/queues/#{@songs[0].id}").success (data) =>
      @songs.shift()
      return true

  addVote: (song) ->
    song[0].voted = true
    song
    @http.post("api/queues/#{song.id}/votes", {song: song, user: @user.id}).success (data) =>
      song[1][0].count += 1
      @songs.push([data.song, [data.vote]])
      console.log(@songs)
      @songs.sort (a, b) =>
        return 1  if a[1][0].count < b[1][0].count
        return -1  if a[1][0].count > b[1][0].count
        return -1  if a[1][0].createdAt > b[1][0].createdAt
        return 1 if a[1][0].createdAt < b[1][0].createdAt
        0


  # signup: (user) ->
  #   @http.post('api/users', user).success (data) =>
  #     console.log(data.user)
  #     if data.user
  #       @scope.user = {}
  #       @http.post('/api/login', user).success (data) =>
  #         console.log(data)
  #         @scope.signup = true
  #         @scope.loginshow = false
  #         @scope.logoutbutton = true
  #         @scope.showsearch = true

  # login: (user) ->
  #   @http.post('api/login', user).success (data) =>
  #     if data.message
  #       @notice = data.message
  #     else
  #       @notice = "Welcome back!"
  #       @scope.signup = true
  #       @scope.loginshow = false
  #       @scope.logoutbutton = true
  #       @scope.showsearch = true

  getLogin: () ->
    console.log('geti')
    @scope.loginshow = true
    @scope.signup = true

  getSignUp: () ->
    @scope.loginshow = false
    @scope.signup = false

SoundsControllers.controller("SoundsCtrl", ["$scope", "$http", "$location", "$filter", "Sound", SoundsCtrl])