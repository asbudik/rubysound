SoundsControllers = angular.module("SoundsControllers", [])

class SoundsCtrl 
  
  constructor: (@scope, @http, @location, @filter, @Sound) ->
    @scope.popFromQueue = (trackToDelete) =>
      # console.log(trackToDelete)
      @http.delete("api/queues/#{trackToDelete[0].id}").success (data) =>
        # console.log("deleted queue")

    # @scope.getSong = (track) =>
    #   # console.log("track", track)
    #   @dummyuser = {}
    #   @dummyuser.id = 1
    #   @newQueue = {}
    #   @newVote = {}
    #   @http.post("api/users/#{@dummyuser.id}/songs", track).success (data) =>
    #     @newQueue = data.queue
    #     @newVote = data.vote
    #     @http.post('api/searchlivebands', {track: track.artist}).success (data) =>
    #       for listing in data
    #         @http.post("api/songs/#{@newQueue.id}/venues", {venuename: listing.formatted_location + " **AT** " + listing.venue.name, venuedate: listing.formatted_datetime, rsvp: listing.facebook_rsvp_url})

    #     @scope.songs.push([@newQueue, [@newVote]])

    @scope.showsearch = true

    @venues = {}
    @scope.getVenues = (queueSong) =>
      @venues = {}
      console.log('am i being called')
      @http.post('api/searchlivebands', {track: queueSong}).success (data) =>
        @venues = data


    @user = ""
    @tracks = {}
    @tracks.soundcloud = []
    @scope.songs = []
    @http.get('api/users').success (data) =>
      @usersData = data

      @users = @usersData
      @scope.songs = @usersData.queue
      if @usersData.session
        @user = @usersData.session
        @scope.signup = true
        @scope.loginshow = false
        @scope.logoutbutton = true
        @user.auth = true

        for song in @scope.songs
          for vote in song[1]
            if vote.uservote == @user.id
              song[0].voted = true

      else
        @guestuser = true
        @scope.showsearch = false
      
      @scope.songs.sort (a, b) =>
        return 1  if a[1][0].count < b[1][0].count
        return -1  if a[1][0].count > b[1][0].count
        console.log(a)
        console.log(b)
        return -1  if a[1][0].createdAt < b[1][0].createdAt
        return 1 if a[1][0].createdAt > b[1][0].createdAt
        0
      if @scope.songs.length > 0
        @http.post('api/searchlivebands', {track: @scope.songs[0][0].artist}).success (data) =>
          count = 0
          @venues = data
          console.log("venues", @venues)

    @scope.addVote = (song) =>
      song[0].voted = true
      console.log("scope", @scope)
      index = @scope.songs.indexOf(song)
      @http.post("api/queues/#{song.id}/votes", {song: song, user: @user.id}).success (data) =>
        @scope.songs.splice(index,1)
        data.song.voted = true
        song[1][0].count += 1
        @scope.songs.push([data.song, [data.vote]])
        @scope.songs.sort (a, b) =>
          return 1  if a[1][0].count < b[1][0].count
          return -1  if a[1][0].count > b[1][0].count
          console.log(a)
          console.log(b)
          return -1  if a[1][0].createdAt < b[1][0].createdAt
          return 1 if a[1][0].createdAt > b[1][0].createdAt
          0

          @scope.songs[0][0].count = 1000000



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

          count += 1


        @scope.clicked = false

  searchLiveBands: (track) ->
    @scope.clicked = true
    @newQueue = {}
    @newVote = {}
    @http.post("api/users/#{@user.id}/songs", {title: track.soundcloudtitle, artist: track.artists[0].name, image: track.album.images[0].url, playthrough: false, url: track.streamUrl}).success (data) =>
      @newQueue = data.queue
      @newVote = data.vote
      @http.post('api/searchlivebands', {track: track.artists[0].name}).success (data) =>
        for listing in data
          @http.post("api/songs/#{@newQueue.id}/venues", {venuename: listing.formatted_location + " **AT** " + listing.venue.name, venuedate: listing.formatted_datetime, rsvp: listing.ticket_url}).success (data) =>
        
        @venuesArray = []
        for singleVenue in data
          @venuesArray.push({venuename: singleVenue.formatted_location + "**AT**" + singleVenue.venue.name, venuedate: singleVenue.formatted_datetime, rsvp: singleVenue.ticket_url})
        
        # @scope.getVenues(track.artists[0].name)
        @scope.songs.push([@newQueue, [@newVote]])
        console.log("THIS IS SCOPE SONGS", @scope.songs)
        if @scope.songs.length == 1
          @scope.songs[0][1][0].count = 1000000
          console.log("scope votes", @scope.songs[0][1][0])
          @scope.songs[0][0].playing = true
          @scope.addVote(@scope.songs[0])

  deleteQueueItem: (queueItem) ->
    @http.delete("api/queues/#{@scope.songs[0].id}").success (data) =>
      @scope.songs.shift()
      return true


  signup: (user) ->
    @http.post('api/users', user).success (data) =>
      console.log("data", data)
      if data.user
        @scope.user = {}
        @http.post('/api/login', user).success (data) =>
          console.log("data", data)
          @user = data.user
          @user.auth = true
          @scope.signup = true
          @scope.loginshow = false
          @scope.logoutbutton = true
          @scope.showsearch = true

  login: (user) ->
    @http.post('api/login', user).success (data) =>
      console.log("login data", data)
      if data.message
        @notice = data.message
      else
        @notice = "Welcome back!"
        @user = data.user
        @user.auth = true
        @scope.signup = true
        @scope.loginshow = false
        @scope.logoutbutton = true
        @scope.showsearch = true

  
  getLogin: () ->
    console.log('geti')
    @scope.loginshow = true
    @scope.signup = true

  getSignUp: () ->
    @scope.loginshow = false
    @scope.signup = false

SoundsControllers.controller("SoundsCtrl", ["$scope", "$http", "$location", "$filter", "Sound", SoundsCtrl])