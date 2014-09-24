SoundsControllers = angular.module("SoundsControllers", [])

class SoundsCtrl 
  
  constructor: (@scope, @http, @location, @filter) ->

    @scope.popFromQueue = (trackToDelete) =>
      # console.log(trackToDelete)
      @http.delete("api/queues/#{trackToDelete[0].id}").success (data) =>
        # console.log("deleted queue")

    # @scope.getSong = (track) =>
    #   @scope.clicked = true
    #   @newQueue = {}
    #   @newVote = {}
    #   @http.post("api/users/#{@user.id}/dummysongs", track).success (data) =>
    #     @newQueue = data.queue
    #     @newVote = data.vote
    #     @users = data.allusers

    #     @scope.songs.push([@newQueue, [@newVote]])
    #     console.log("THIS IS SCOPE SONGS", @scope.songs)
    #     if @scope.songs.length == 1
    #       @scope.songs[0][1][0].count = 1000000
    #       console.log("scope votes", @scope.songs[0][1][0])
    #       @scope.songs[0][0].playing = true
    #       @scope.addVote(@scope.songs[0])

    #       @scope.getVenues(track.artists[0].name)

    @scope.showsearch = true

    @venues = {}
    @scope.getVenues = (queueSong) =>
      @venues = {}
      console.log('am i being called')
      @http.post('api/searchlivebands', {track: queueSong}).success (data) =>
        @venues = data
        console.log(data)

    @scope.hideImage = false
    @scope.noDupeSongs = true
    @user = ""
    @error = false
    @tracks = {}
    @tracks.soundcloud = []
    @scope.songs = []
    @http.get('api/users').success (data) =>
      @usersData = data

      @users = @usersData.allusers
      console.log("users", @users)
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
        @scope.hideImage = false
        @http.post('api/searchlivebands', {track: @scope.songs[0][0].artist}).success (data) =>
          count = 0
          @venues = data
          console.log("venues", @venues)

      else
        @scope.hideImage = true

    @scope.addVote = (song) =>
      song[0].voted = true
      console.log("scope", song)

      index = @scope.songs.indexOf(song)
      @http.post("api/queues/#{song.id}/votes", {song: song, user: @user.id}).success (data) =>
        data.song.voted = true
        song[1][0].count += 1

        if @scope.songs.length > 1
          @scope.songs.splice(index,1)
          @scope.songs.push([data.song, [data.vote]])
          @scope.songs.sort (a, b) =>
            return 1  if a[1][0].count < b[1][0].count
            return -1  if a[1][0].count > b[1][0].count
            console.log(a)
            console.log(b)
            return -1  if a[1][0].createdAt < b[1][0].createdAt
            return 1 if a[1][0].createdAt > b[1][0].createdAt
            0
          
        @scope.songs[0][0].playing = true
        @scope.songs[0][0].count = 1000000
        console.log(@scope.songs[0])



  searchSongs: (query) ->
    @loading = true
    thisQuery = query
    @scope.query = {}
    @tracks = {}
    @tracks.soundcloud = []
    @http.post('api/soundcloud', {query: query.string}).success (data) =>
      console.log("DATA", data)
      if data.length > 0
        @error = false
        for track in data
          if track.streamable == true
            @tracks.soundcloud.push(track)



        @http.post('api/spotify', {query: query.string, limiter: @tracks.soundcloud.length}).success (data) =>
          @loading = false
          @tracks.spotify = data
          console.log(@tracks.spotify)

          count = 0
          for track in @tracks.spotify.tracks.items
            track.streamUrl = @tracks.soundcloud[count].permalink_url
            track.soundcloudtitle = @tracks.soundcloud[count].title

            count += 1

      else
        @error = true
        @loading = false
        @notice = "no results found"
      @scope.clicked = false

  searchLiveBands: (track) ->
    @scope.clicked = true
    @newQueue = {}
    @newVote = {}
    @http.post("api/users/#{@user.id}/songs", {title: track.soundcloudtitle, artist: track.artists[0].name, image: track.album.images[0].url, playthrough: false, url: track.streamUrl}).success (data) =>
      @newQueue = data.queue
      @newVote = data.vote
      # @users = data.allusers
      # @http.post('api/searchlivebands', {track: track.artists[0].name}).success (data) =>
        # for listing in data
        #   @http.post("api/songs/#{@newQueue.id}/venues", {venuename: listing.formatted_location + " **AT** " + listing.venue.name, venuedate: listing.formatted_datetime, rsvp: listing.ticket_url}).success (data) =>
        
        # @venuesArray = []
        # for singleVenue in data
        #   @venuesArray.push({venuename: singleVenue.formatted_location + "**AT**" + singleVenue.venue.name, venuedate: singleVenue.formatted_datetime, rsvp: singleVenue.ticket_url})
        
        # @scope.getVenues(track.artists[0].name)
      @scope.songs.push([@newQueue, [@newVote]])
      @scope.noDupeSongs = true

      # console.log("THIS IS SCOPE SONGS", @scope.songs)
      if @scope.songs.length == 1
        @scope.songs[0][1][0].count = 1000000
        # console.log("scope votes", @scope.songs[0][1][0])
        @scope.songs[0][0].playing = true
        @scope.addVote(@scope.songs[0])

        # @scope.getVenues(track.artists[0].name)

  deleteQueueItem: (queueItem) ->
    @http.delete("api/queues/#{@scope.songs[0].id}").success (data) =>
      @scope.songs.shift()
      return true


  signup: (user) ->
    user.contributions = 0
    user.image = 'http://png-5.findicons.com/files/icons/1580/devine_icons_part_2/512/cd_music.png'
    @http.post('api/users', user).success (data) =>
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
          @users.push(data.user)
          @error = false

      else
        @error = true
        @notice = data
        console.log(@notice)

  login: (user) ->
    @http.post('api/login', user).success (data) =>
      console.log("login data", data)
      if data.message
        @error = true
        @notice = data
      else
        @user = data.user
        @user.auth = true
        @scope.signup = true
        @scope.loginshow = false
        @scope.logoutbutton = true
        @scope.showsearch = true
        @error = false

  
  getLogin: () ->
    console.log('geti')
    @scope.loginshow = true
    @scope.signup = true
    @error = false

  getSignUp: () ->
    @scope.loginshow = false
    @scope.signup = false
    @error = false

SoundsControllers.controller("SoundsCtrl", ["$scope", "$http", "$location", "$filter", SoundsCtrl])