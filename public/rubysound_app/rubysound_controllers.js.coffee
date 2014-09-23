SoundsControllers = angular.module("SoundsControllers", [])

class SoundsCtrl 
  
  constructor: (@scope, @http, @location, @filter, @Sound) ->
    @scope.popFromQueue = (trackToDelete) =>
      console.log(trackToDelete)
      @http.delete("api/queues/#{trackToDelete[0].id}").success (data) ->
        console.log("deleted queue")

    @scope.getSong = (track) =>
      console.log("track", track)
      @dummyuser = {}
      @dummyuser.id = 1
      @newQueue = {}
      @newVote = {}
      @http.post("api/users/#{@dummyuser.id}/songs", track).success (data) =>
        @newQueue = data.queue
        @newVote = data.vote
        @http.post('api/searchlivebands', {track: track.artist}).success (data) =>
          for listing in data
            @http.post("api/songs/#{@newQueue.id}/venues", {venuename: listing.formatted_location + " **AT** " + listing.venue.name, venuedate: listing.formatted_datetime, rsvp: listing.facebook_rsvp_url})

        @scope.songs.push([@newQueue, [@newVote]])


    @scope.showsearch = true

    @user = ""
    @tracks = {}
    @tracks.soundcloud = []
    @scope.songs = []
    @http.get('api/users').success (data) =>
      @users = data
      @scope.songs = data.queue
      if data.session
        @user = data.session
        @scope.signup = true
        @scope.loginshow = false
        @scope.logoutbutton = true

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
          @http.post("api/songs/#{@newQueue.id}/venues", {venuename: listing.formatted_location + " **AT** " + listing.venue.name, venuedate: listing.formatted_datetime, rsvp: listing.facebook_rsvp_url})

      @scope.songs.push([@newQueue, [@newVote]])

  deleteQueueItem: (queueItem) ->
    @http.delete("api/queues/#{@scope.songs[0].id}").success (data) =>
      @scope.songs.shift()
      return true

  addVote: (song) ->
    song[0].voted = true
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