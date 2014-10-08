SoundsControllers = angular.module("SoundsControllers", [])

class SoundsCtrl 
  
  constructor: (@scope, @http, @location, @filter, @rootScope) ->
    @rootScope.socket = io.connect('http://localhost:3000')

    @clientID = 'a193506e4d1a399fbb796fd18bfd3a3b'
    @scope.msgs = []
    # console.log("ROOTSCOPE", @rootScope.socket)
    @scope.msg = {}
    @scope.sendMsg = () =>
      message = @scope.msg
      @scope.msg = {}
      @rootScope.socket.emit('send msg', {user: @rootScope.socket[@user.id], msg: message.text})

    @rootScope.socket.on 'get msg', (data) =>
      console.log("DATA", data)
      @scope.msgs.push(data)
      @scope.$digest()

    @rootScope.socket.on 'get create song', (createSong) =>
      @scope.songs.push(createSong)
      # @rootScope.$digest()
      # @scope.$digest()
      @scope.noDupeSongs = true
      console.log("SCOPE SONGS", @scope.songs)
      console.log("DATA", createSong)

      # console.log("THIS IS SCOPE SONGS", @scope.songs)
      if @scope.songs.length == 1
        @scope.songs[0][1][0].count = 1000000
        # console.log("scope votes", @scope.songs[0][1][0])
        @scope.songs[0][0].playing = true
        @scope.addVote(@scope.songs[0])

        console.log("CREATESONG", createSong)
        @scope.getVenues(createSong[0].artist)
        @scope.$digest()

    @rootScope.socket.on 'get add vote', (data) =>
      data.data.song.voted = true
      data.song[1][0].count += 1
      data.song[1][0].createdAt = data.data.vote.createdAt

      if @scope.songs.length > 1
        @scope.songs[data.index][1][0].count += 1
        @rootScope.tracks[data.index].count += 1
        # @scope.songs.splice(index,1)
        # @scope.songs.push([data.song, [data.vote]])
        @rootScope.tracks.sort (a, b) =>
          return 1  if a.count < b.count
          return -1  if a.count > b.count
          console.log(a)
          console.log(b)
          return -1  if a.createdAt < b.createdAt
          return 1 if a.createdAt > b.createdAt
          0

        console.log("@rootscope tracks", @rootScope.tracks)

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
      console.log(@scope.songs)
      @scope.$digest()


    @scope.popFromQueue = (trackToDelete) =>
      # console.log(trackToDelete)
      @http.delete("api/queues/#{trackToDelete[0].id}").success (data) =>
        # console.log("deleted queue")


    @scope.showsearch = true

    @venues = {}
    @scope.getVenues = (queueSong) =>
      @venues = {}
      # console.log('am i being called')
      if queueSong
        @http.post('api/searchlivebands', {track: queueSong}).success (data) =>
          @venues = data
        # console.log(data)

    @scope.tileclick = false
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
      # console.log("users", @users)
      @scope.songs = @usersData.queue
      if @usersData.session
        @user = @usersData.session
        console.log("USER", @user)
        @rootScope.socket[@user.id] = @user.username
        for user in @users
          if user.id == @user.id
            user.auth = true
          else
            user.auth = false

        @scope.signup = true
        @scope.loginshow = false
        @scope.logoutbutton = true
        @user.auth = true
        if @scope.songs != []
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
          # console.log("venues", @venues)

      else
        @scope.hideImage = true

    @scope.addVote = (song) =>
      song[0].voted = true
      # console.log("scope", song)

      index = @scope.songs.indexOf(song)
      @http.post("api/queues/#{song.id}/votes", {song: song, user: @user.id}).success (data) =>
        @rootScope.socket.emit('send add vote', {song: song, data: data, index: index})



  searchSongs: (query) ->
    console.log("SCOPE QUERY", @scope.query)
    @loading = true
    thisQuery = query
    @scope.query = {}
    @tracks = {}
    @tracks.soundcloud = []
    @error = false
    @http.post('api/soundcloud', {query: query.string}).success (data) =>
      # console.log("DATA", data)
      if data.length > 0
        for track in data
          if track.streamable == true
            @tracks.soundcloud.push(track)



        @http.post('api/spotify', {query: query.string, limiter: @tracks.soundcloud.length}).success (data) =>
          @loading = false
          @tracks.spotify = data
          # console.log(@tracks.spotify)

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
    params = { url: track.streamUrl, client_id: @clientID, callback: 'JSON_CALLBACK' }
    @http.jsonp('//api.soundcloud.com/resolve.json', { params: params }).success (data) =>
      console.log("SONG DATA LIVEBANDS", data)
      @http.post("api/users/#{@user.id}/songs", {title: track.soundcloudtitle, artist: track.artists[0].name, image: track.album.images[0].url, playthrough: false, url: data.stream_url, duration: data.duration}).success (data) =>
        @newQueue = data.queue
        @newVote = data.vote
        @scope.newSong = [@newQueue, [@newVote]]
        @rootScope.socket.emit('send create song', @scope.newSong)

    for user in @users
      if user.id == @user.id
        user.contributions += 1
        user.image = track.album.images[0].url

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
          # console.log("data", data)
          @user = data.user
          @user.auth = true
          @scope.signup = true
          @scope.loginshow = false
          @scope.logoutbutton = true
          @scope.showsearch = true
          @users.push(data.user)
          @error = false
          @guestuser = false
          @rootScope.socket[@user.id] = @user.username

      else
        @error = true
        @notice = data
        # console.log(@notice)

  login: (user) ->
    @http.post('api/login', user).success (data) =>
      # console.log("login data", data)
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
        @guestuser = false
        @rootScope.socket[@user.id] = @user.username

        if @scope.songs != []
          for song in @scope.songs
            for vote in song[1]
              if vote.uservote == @user.id
                song[0].voted = true
  
  getLogin: () ->
    # console.log('geti')
    @scope.loginshow = true
    @scope.signup = true
    @error = false

  getSignUp: () ->
    @scope.loginshow = false
    @scope.signup = false
    @error = false

  usertileclick: () ->
    @scope.tileclick = true

  chattileclick: () ->
    @scope.tileclick = false


SoundsControllers.controller("SoundsCtrl", ["$scope", "$http", "$location", "$filter", "$rootScope", SoundsCtrl])