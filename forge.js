var forge = angular.module("forge", ["services", "controllers.App", "controllers.ServerIndex", "controllers.ServerDetail", "controllers.SiteDetail", "controllers.RecipeIndex", "controllers.UserProfile", "controllers.Register"]);
forge.filter("moment", function () {
  return function (e, r) {
    return moment.unix(e).format(r)
  }
});
var services = angular.module("services", []);
services.service("PusherService", function () {
  "undefined" != typeof LARAVEL_USER && (this.pusher = new Pusher("6a37de83b9c874da7001"), this.refreshOn = function (e, r) {
    this.channel = this.pusher.subscribe(e), this.channel.bind("refresh", function () {
      r.refreshData()
    })
  })
});
var app = angular.module("controllers.App", []);
app.controller("AppController", ["$scope", "$http", "PusherService", function (e, r, s) {
  "undefined" != typeof LARAVEL_USER && (console.log("Booting App Controller"), e.refreshData = function () {
    r.get("/api/servers/list").success(function (r) {
      e.serverList = r
    })
  }, e.refreshData(), s.refreshOn("servers-" + LARAVEL_USER, e))
}]);
var recipeIndex = angular.module("controllers.RecipeIndex", ["ui.ace"]);
recipeIndex.controller("RecipeIndexController", ["$scope", "$http", "PusherService", function (e, r) {
  function s() {
    this.name = "", this.user = "root", this.script = "", this.disabled = !1, this.errors = []
  }

  function t() {
    this.name = "", this.user = "", this.script = "", this.disabled = !1, this.errors = []
  }

  function o() {
    this.disabled = !1, this.errors = []
  }

  e.recipesLoaded = !1, e.runGroup = [], e.recipeForm = new s, e.editRecipeForm = new t, e.runRecipeForm = new o, e.refreshData = function () {
    r.get("/api/user").success(function (r) {
      e.user = r
    }), r.get("/api/servers/active").success(function (r) {
      e.servers = r
    }), r.get("/api/recipes").success(function (r) {
      e.recipes = r, e.recipesLoaded = !0
    })
  }, e.refreshData(), e.addRecipe = function () {
    e.recipeForm.errors = [], e.recipeForm.disabled = !0, r.post("/recipes", {
      name: e.recipeForm.name,
      user: e.recipeForm.user,
      script: e.recipeForm.script
    }).success(function (r) {
      e.recipes.push(r), e.recipeForm = new s
    }).error(function (r) {
      e.recipeForm.errors = r, e.recipeForm.disabled = !1
    })
  }, e.showEditRecipeModal = function (r) {
    e.editingRecipe = r, e.editRecipeForm.name = e.editingRecipe.name, e.editRecipeForm.user = e.editingRecipe.user, e.editRecipeForm.script = e.editingRecipe.script, $("#modal-edit-recipe").modal("show")
  }, e.editRecipe = function () {
    e.editRecipeForm.errors = [], e.editRecipeForm.disabled = !0, r.put("/recipes/" + e.editingRecipe.id, {
      name: e.editRecipeForm.name,
      user: e.editRecipeForm.user,
      script: e.editRecipeForm.script
    }).success(function (r) {
      current = _.find(e.recipes, function (e) {
        return e.id == r.id
      }), current.name = r.name, current.user = r.user, current.script = r.script, $("#modal-edit-recipe").modal("hide"), e.editRecipeForm = new t
    }).error(function (r) {
      e.editRecipeForm.errors = r, e.editRecipeForm.disabled = !1
    })
  }, e.showRunRecipeModal = function (r) {
    e.runGroup = [], e.runningRecipe = r, $("#modal-run-recipe").modal("show")
  }, e.runRecipe = function () {
    e.runRecipeForm.errors = [], e.runRecipeForm.disabled = !0, r.post("/recipes/" + e.runningRecipe.id + "/run", {servers: e.runGroup}).success(function () {
      $("#modal-run-recipe").modal("hide"), e.runRecipeForm = new o
    }).error(function (r) {
      e.runRecipeForm.errors = r, e.runRecipeForm.disabled = !1
    })
  }, e.toggleRunStatus = function (r) {
    e.runGroup.indexOf(r.id) > -1 ? e.runGroup.splice(e.runGroup.indexOf(r.id), 1) : e.runGroup.push(r.id), console.log(e.runGroup)
  }, e.inRunGroup = function (r) {
    return e.runGroup.indexOf(r.id) > -1
  }, e.showDeleteRecipeModal = function (r) {
    e.deletingRecipe = r.id, $("#modal-delete-recipe").modal("show")
  }, e.deleteRecipe = function () {
    r.delete("/recipes/" + e.deletingRecipe), e.recipes = _.reject(e.recipes, function (r) {
      return r.id == e.deletingRecipe
    }), $("#modal-delete-recipe").modal("hide")
  }
}]);
var register = angular.module("controllers.Register", []);
register.controller("RegisterController", ["$scope", "$http", "$window", function (e, r, s) {
  function t() {
    this.name = "", this.email = "", this.password = "", this.passwordConfirmation = "", this.card = "", this.cvc = "", this.expirationMonth = "", this.expirationYear = "", this.registering = !1, this.errors = [], this.disabled = !1
  }

  $(document).ready(function () {
    $("#name").focus()
  }), e.registerForm = new t, Stripe.setPublishableKey(STRIPE_KEY), e.register = function () {
    e.registerForm.errors = [], e.registerForm.disabled = !0, e.registerForm.registering = !0, Stripe.card.createToken($("#payment-form"), function (t, o) {
      o.error ? (e.registerForm.errors.push(o.error.message), e.registerForm.disabled = !1, e.registerForm.registering = !1, e.$apply()) : r.post("/auth/register", {
        name: e.registerForm.name,
        email: e.registerForm.email,
        password: e.registerForm.password,
        password_confirmation: e.registerForm.passwordConfirmation,
        terms: e.registerForm.termsAccepted,
        stripe_token: o.id
      }).success(function () {
        s.location = "https://forge.laravel.com/servers"
      }).error(function (r) {
        e.registerForm.errors = r, e.registerForm.disabled = !1, e.registerForm.registering = !1
      })
    })
  }
}]);
var serverDetail = angular.module("controllers.ServerDetail", []);
serverDetail.controller("ServerDetailController", ["$scope", "$http", "$timeout", "PusherService", function (e, r, s, t) {
  function o() {
    this.name = "", this.directory = "public", this.wildcards = !1, this.errors = [], this.disabled = !1
  }

  function i() {
    this.command = "php /home/forge/default/artisan scheduled:run", this.user = "forge", this.frequency = "minutely", this.minute = "*", this.hour = "*", this.day = "*", this.month = "*", this.weekday = "*", this.disabled = !1, this.errors = []
  }

  function n() {
    this.command = "", this.user = "forge", this.successful = !1, this.disabled = !1, this.errors = []
  }

  function a() {
    this.name = "", this.port = "", this.ip_address = "", this.disabled = !1, this.errors = []
  }

  function c() {
    this.key = "", this.errors = [], this.disabled = !1
  }

  function d() {
    this.host = "", this.errors = [], this.disabled = !1
  }

  function l() {
    this.ipAddress = "", this.size = 0, this.errors = [], this.disabled = !1
  }

  e.serverLoaded = !1, e.gettingDaemonStatus = !1, e.siteForm = new o, e.deleteSiteForm = {disabled: !1}, e.jobForm = new i, e.daemonForm = new n, e.friendsForm = {
    showStatus: !1,
    disabled: !1
  }, e.firewallForm = new a, e.relicForm = new c, e.paperForm = new d, e.metaForm = new l, e.keyForm = {
    name: "",
    key: "",
    errors: [],
    disabled: !1
  }, t.refreshOn("server-" + SERVER_ID, e), e.refreshData = function () {
    r.get("/api/servers/" + SERVER_ID).success(function (r) {
      e.server = r, e.serverLoaded = !0, e.refreshNetworkableServers(), e.metaForm.ipAddress = r.ip_address, e.metaForm.size = +r.size.replace(/[^0-9]/g, "")
    })
  }, e.refreshServers = function () {
    r.get("/api/servers/active").success(function (r) {
      e.servers = _.reject(r, function (e) {
        return e.id == SERVER_ID
      }), e.refreshNetworkableServers()
    })
  }, e.refreshNetworkableServers = function () {
    e.servers && e.server && (e.networkableServers = _.filter(e.servers, function (r) {
      return r.provider == e.server.provider && r.region == e.server.region
    }), e.hasNetworkableServers = e.networkableServers.length > 0)
  }, e.refreshData(), e.refreshServers(), e.getAppIcon = function (e) {
    return "Wordpress" == e || "WordPress" == e ? "fa-wordpress" : "Minecraft" == e ? "fa-cubes" : "Craft" == e ? "fa-cubes" : void 0
  }, e.serverHasSites = function (e) {
    return 0 == e.sites.length ? !1 : _.toArray(_.filter(e.sites, function (e) {
      return "installing" == e.status || "installed" == e.status
    })).length > 0
  }, e.siteShowable = function () {
    return function (e) {
      return "removing" != e.status
    }
  }, e.siteHasActiveCertificate = function (e) {
    var r = !1;
    return _.each(e.certificates, function (e) {
      e.active && (r = !0)
    }), r
  }, e.addSite = function () {
    e.siteForm.errors = [], e.siteForm.disabled = !0, r.post("/servers/" + SERVER_ID + "/sites", {
      site_name: e.siteForm.name,
      directory: e.siteForm.directory,
      wildcards: e.siteForm.wildcards
    }).success(function (r) {
      e.server.sites.push(r), e.siteForm = new o
    }).error(function (r) {
      e.siteForm.errors = r, e.siteForm.disabled = !1
    })
  }, e.showDeleteSiteModal = function (r) {
    e.deletingSite = r, $("#modal-delete-site").modal("show")
  }, e.deleteSite = function () {
    e.deleteSiteForm.disabled = !0, r.delete("/api/servers/" + SERVER_ID + "/sites/" + e.deletingSite).success(function (r) {
      e.server = r, $("#modal-delete-site").modal("hide"), e.deleteSiteForm.disabled = !1
    })
  }, e.isFriend = function (r) {
    var s = _.find(e.server.friends, function (e) {
      return e.id == r.id
    });
    return void 0 !== s
  }, e.toggleCustomSchedule = function () {
    s(function () {
      $("#custom-schedule").select()
    }, 100)
  }, e.addJob = function () {
    e.jobForm.errors = [], e.jobForm.disabled = !0, r.post("/servers/" + SERVER_ID + "/job", {
      command: e.jobForm.command,
      user: e.jobForm.user,
      frequency: e.jobForm.frequency,
      minute: e.jobForm.minute,
      hour: e.jobForm.hour,
      day: e.jobForm.day,
      month: e.jobForm.month,
      weekday: e.jobForm.weekday
    }).success(function (r) {
      e.server = r, e.jobForm = new i
    }).error(function (r) {
      e.jobForm.errors = r, e.jobForm.disabled = !1
    })
  }, e.showJobLogModal = function (s) {
    e.loadingJobLog = !0, r.get("/servers/" + SERVER_ID + "/job/" + s.id + "/log").success(function (r) {
      "" == r.trim() && (r = "No log information available."), e.jobLog = r, e.loadingJobLog = !1, $("#modal-job-log").modal("show")
    }).error(function () {
      e.loadingJobLog = !1
    })
  }, e.deleteJob = function (s) {
    r.delete("/servers/" + SERVER_ID + "/job/" + s.id), e.server.jobs = _.reject(e.server.jobs, function (e) {
      return e.id == s.id
    })
  }, e.formatFrequency = function (e) {
    return "Minutely" == e ? "Every Minute" : e
  }, e.addDaemon = function () {
    e.daemonForm.errors = [], e.daemonForm.disabled = !0, r.post("/servers/" + SERVER_ID + "/daemons", {
      command: e.daemonForm.command,
      user: e.daemonForm.user
    }).success(function (r) {
      e.server = r, e.daemonForm = new n
    }).error(function (r) {
      e.daemonForm.errors = r, e.daemonForm.disabled = !1
    })
  }, e.showDaemonStatus = function (s) {
    e.gettingDaemonStatus = !0, r.get("/servers/" + SERVER_ID + "/daemons/" + s.id + "/status").success(function (r) {
      "" == r.trim() && (r = "No status information available."), e.daemonStatus = r, e.gettingDaemonStatus = !1, $("#modal-daemon-status").modal("show")
    })
  }, e.restartDaemon = function (s) {
    r.post("/servers/" + SERVER_ID + "/daemons/" + s.id + "/restart").success(function (r) {
      e.server = r
    })
  }, e.deleteDaemon = function (s) {
    r.delete("/servers/" + SERVER_ID + "/daemons/" + s.id), e.server.daemons = _.reject(e.server.daemons, function (e) {
      return e.id == s.id
    })
  }, e.toggleFriendship = function (r) {
    e.isFriend(r) ? e.server.friends = _.reject(e.server.friends, function (e) {
      return e.id == r.id
    }) : e.server.friends.push(r)
  }, e.syncFriends = function () {
    e.friendsForm.disabled = !0, e.friendsForm.showStatus = !1, r.put("/servers/" + SERVER_ID + "/friends", {
      friends: _.map(e.server.friends, function (e) {
        return e.id
      })
    }).success(function (r) {
      e.server = r, e.friendsForm.disabled = !1, e.friendsForm.showStatus = !0
    })
  }, e.addFirewallRule = function () {
    e.firewallForm.errors = [], e.firewallForm.disabled = !0, r.post("/servers/" + SERVER_ID + "/rules", {
      name: e.firewallForm.name,
      port: e.firewallForm.port,
      ip_address: e.firewallForm.ip_address
    }).success(function (r) {
      e.server = r, e.firewallForm = new a
    }).error(function (r) {
      e.firewallForm.errors = r, e.firewallForm.disabled = !1
    })
  }, e.deleteFirewallRule = function (s) {
    r.delete("/servers/" + SERVER_ID + "/rules/" + s.id), e.server.rules = _.reject(e.server.rules, function (e) {
      return e.id == s.id
    })
  }, e.installNewRelic = function () {
    e.relicForm.errors = [], e.relicForm.disabled = !0, r.post("/servers/" + SERVER_ID + "/relic", {key: e.relicForm.key}).success(function (r) {
      e.server = r, e.relicForm = new c
    }).error(function (r) {
      e.relicForm.errors = r, e.relicForm.disabled = !1
    })
  }, e.installPapertrail = function () {
    e.paperForm.errors = [], e.paperForm.disabled = !0, r.post("/servers/" + SERVER_ID + "/papertrail", {host: e.paperForm.host}).success(function (r) {
      e.server = r, e.paperForm = new d
    }).error(function (r) {
      e.paperForm.errors = r, e.paperForm.disabled = !1
    })
  }, e.updateMetadata = function () {
    e.metaForm.errors = [], e.metaForm.disabled = !0, e.metaForm.successful = !1, r.put("/servers/" + SERVER_ID + "/meta", {
      ip_address: e.metaForm.ipAddress,
      size: e.metaForm.size
    }).success(function (r) {
      e.server = r, e.metaForm.disabled = !1, e.metaForm.successful = !0
    }).error(function (r) {
      e.metaForm.errors = r, e.metaForm.disabled = !1
    })
  }, e.addKey = function () {
    e.keyForm.errors = [], e.keyForm.disabled = !0, r.post("/servers/" + SERVER_ID + "/key", {
      name: e.keyForm.name,
      key: e.keyForm.key
    }).success(function (r) {
      e.server.keys.push(r), e.keyForm.name = "", e.keyForm.key = "", e.keyForm.disabled = !1
    }).error(function (r) {
      e.keyForm.errors = r, e.keyForm.disabled = !1
    })
  }, e.deleteKey = function (s) {
    r.delete("/servers/" + SERVER_ID + "/key/" + s.id), e.server.keys = _.reject(e.server.keys, function (e) {
      return s.id == e.id
    })
  }, e.rebootServer = function () {
    r.post("/servers/" + SERVER_ID + "/reboot")
  }, e.rebootNginx = function () {
    r.post("/servers/" + SERVER_ID + "/reboot/nginx")
  }, e.rebootMySQL = function () {
    r.post("/servers/" + SERVER_ID + "/reboot/mysql")
  }, e.rebootPostgres = function () {
    r.post("/servers/" + SERVER_ID + "/reboot/postgres")
  }, e.stopNginx = function () {
    r.post("/servers/" + SERVER_ID + "/stop/nginx")
  }, e.stopMySQL = function () {
    r.post("/servers/" + SERVER_ID + "/stop/mysql")
  }, e.stopPostgres = function () {
    r.post("/servers/" + SERVER_ID + "/stop/postgres")
  }, e.removeFromForge = function () {
    $("#remove-forge-btn").click()
  }, e.resetServer = function () {
    r.post("/servers/" + SERVER_ID + "/reset").success(function (r) {
      e.server = r, $("#modal-reset-server").modal("hide")
    })
  }, e.deleteServer = function () {
    $("#delete-server-btn").click()
  }
}]);
var serverIndex = angular.module("controllers.ServerIndex", []);
serverIndex.controller("ServerIndexController", ["$scope", "$http", "PusherService", function (e, r, s) {
  e.userLoaded = !1, e.eventsLoaded = !1, e.serversLoaded = !1, e.regionsLoaded = !1, e.serverNameLoaded = !1, e.customProvisionUrl = null, $("#provider-tabs li").first().addClass("active"), $(".tab-content .tab-pane").first().addClass("active"), e.oceanForm = {
    credential: null,
    name: "",
    size: "2GB",
    region: 4,
    database: "forge",
    installHipHop: !1,
    backups: !1,
    disabled: !1
  }, e.linodeForm = {
    credential: null,
    name: "",
    size: "2GB",
    region: 6,
    database: "forge",
    installHipHop: !1,
    backups: !1,
    disabled: !1
  }, e.customForm = {
    credential: null,
    name: "",
    size: "2",
    ipAddress: "",
    privateIpAddress: "",
    region: null,
    database: "forge",
    installHipHop: !1,
    backups: !1,
    disabled: !1
  }, e.getServerName = function () {
    r.get("/herokize").success(function (r) {
      e.oceanForm.name = r, e.linodeForm.name = r, e.customForm.name = r, e.serverNameLoaded = !0
    })
  }, e.refreshData = function () {
    r.get("/api/servers").success(function (r) {
      e.servers = r, e.serversLoaded = !0
    })
  }, e.getUser = function () {
    r.get("/api/user").success(function (r) {
      e.user = r, e.userLoaded = !0
    })
  }, e.getRegions = function () {
    r.get("/api/regions").success(function (r) {
      e.oceanRegions = r.ocean, e.linodeRegions = r.linode, e.regionsLoaded = !0
    })
  }, e.getEvents = function () {
    r.get("/api/servers/events/recent").success(function (r) {
      e.events = r, e.eventsLoaded = !0
    })
  }, e.getUser(), e.getEvents(), e.getRegions(), e.refreshData(), e.getServerName(), s.refreshOn("servers-" + LARAVEL_USER, e), e.eventChannel = s.pusher.subscribe("events-" + LARAVEL_USER), e.eventChannel.bind("new", function (r) {
    e.events.unshift(JSON.parse(r)), e.events.length > 7 && e.events.pop(), e.$apply()
  }), e.hasShowableServers = function () {
    var r = !1;
    return _.each(e.servers, function (e) {
      e.revoked || (r = !0)
    }), r
  }, e.serverShowable = function () {
    return function (e) {
      return !e.revoked
    }
  }, e.addOceanServer = function () {
    e.addServer(e.oceanForm, "ocean")
  }, e.addLinodeServer = function () {
    e.addServer(e.linodeForm, "linode")
  }, e.addCustomServer = function () {
    e.customForm.errors = [], e.customForm.disabled = !0, r.post("/servers", {
      provider: "custom",
      name: e.customForm.name,
      size: e.customForm.size,
      ip_address: e.customForm.ipAddress,
      private_ip_address: e.customForm.privateIpAddress,
      database: e.customForm.database,
      hhvm: e.customForm.installHipHop,
      backups: e.customForm.backups,
      timezone: jstz.determine().name()
    }).success(function (r) {
      e.getServerName(), e.customForm.disabled = !1, e.customForm.installHipHop = !1, e.showCustomServerModal(r)
    }).error(function (r) {
      e.customForm.errors = r, e.customForm.disabled = !1
    })
  }, e.showCustomServerModal = function (r) {
    e.customProvisionUrl = "https://forge.laravel.com/servers/" + r.id + "/vps?forge_token=" + e.user.forge_token, $("#modal-custom-server").modal("show")
  }, e.addServer = function (s, t) {
    s.errors = [], s.disabled = !0, r.post("/servers", {
      provider: t,
      credential: s.credential,
      name: s.name,
      size: s.size,
      region: s.region,
      database: s.database,
      hhvm: s.installHipHop,
      backups: s.backups,
      timezone: jstz.determine().name()
    }).success(function () {
      e.getServerName(), s.disabled = !1, s.installHipHop = !1
    }).error(function (e) {
      s.errors = e, s.disabled = !1
    })
  }, e.getCredentialsForProvider = function (r) {
    return _.filter(e.user.credentials, function (e) {
      return e.type == r
    })
  }, e.getFirstCredentialForProvider = function (r) {
    return providers = e.getCredentialsForProvider(r), providers[0].id
  }, e.formatEventDate = function (e) {
    return moment(e + " +0000", "YYYY-MM-DD hh:mm:ss Z").format("MMMM Do, h:mm:ss A")
  }
}]);
var siteDetail = angular.module("controllers.SiteDetail", []);
siteDetail.controller("SiteDetailController", ["$scope", "$http", "$timeout", "PusherService", function (e, r, s, t) {
  function o() {
    this.showInstallGit = !1, this.showInstallCraft = !1, this.showInstallWordpress = !1, this.showInstallMinecraft = !1, this.showingAppForm = !1
  }

  function i() {
    this.provider = null, this.name = "", this.branch = "master", this.runComposer = !0, this.runMigrations = !1, this.disabled = !1, this.errors = []
  }

  function n() {
    this.disabled = !1, this.errors = []
  }

  function a() {
    this.disabled = !1
  }

  function c() {
    this.token = "", this.room = "", this.disabled = !1, this.errors = []
  }

  function d() {
    this.disabled = !1
  }

  function l() {
    this.rollbackMigrations = !1, this.disabled = !1
  }

  function u() {
    this.database = "craft", this.password = "", this.licenseAccepted = !1, this.disabled = !1, this.errors = []
  }

  function m() {
    this.database = "wordpress", this.password = "", this.disabled = !1, this.errors = []
  }

  function p() {
    this.username = "", this.ram = "1024", this.disabled = !1, this.errors = []
  }

  function f() {
    this.key = "", this.value = "", this.environment = null, this.disabled = !1, this.errors = []
  }

  function F() {
    this.connection = "beanstalkd", this.queue = "default", this.timeout = 60, this.sleep = 10, this.tries = null, this.daemon = !1, this.disabled = !1, this.errors = []
  }

  function h() {
    this.disabled = !1
  }

  function b() {
    this.source = "csr", this.errors = [], this.disabled = !1
  }

  function w() {
    this.domain = "", this.country = "", this.state = "", this.city = "", this.organization = "", this.department = ""
  }

  function v() {
    this.key = "", this.cert = ""
  }

  function g() {
    this.cert = null
  }

  function S() {
    this.cert = "", this.disabled = !1, this.errors = []
  }

  function R() {
    this.csr = ""
  }

  function E() {
    this.config = "", this.disabled = !1, this.errors = []
  }

  e.siteLoaded = !1, e.certActivating = !1, e.gettingWorkerStatus = !1, e.deployButton = {disabled: !1}, e.showLatestDeploymentLogButton = {disabled: !1}, e.editingDeployScript = !1, e.originalDeployScript = null, e.appFormState = new o, e.repoForm = new i, e.deployScriptForm = new n, e.deployForm = new a, e.hipchatForm = new c, e.disableHipchatForm = new d, e.uninstallRepoForm = new l, e.craftForm = new u, e.wordpressForm = new m, e.minecraftForm = new p, e.environmentForm = new f, e.workerForm = new F, e.scheduleForm = new h, e.newCertForm = new b, e.csrForm = new w, e.existingCertForm = new v, e.cloneCertForm = new g, e.certForm = new S, e.csrModal = new R, e.editNginxForm = new E, t.refreshOn("site-" + SITE_ID, e), e.refreshData = function () {
    r.get("/api/servers/" + SERVER_ID + "/sites/" + SITE_ID).success(function (r) {
      e.site = r, e.repoForm.provider = e.site.server.user.connected_to_github ? "github" : "bitbucket", "" == e.csrForm.domain && (e.csrForm.domain = r.name), e.deployButton.disabled = null != r.deployment_status, e.siteLoaded = !0
    })
  }, e.getAvailableCertificates = function () {
    r.get("/api/servers/sites/certificates/available?except=" + SERVER_ID).success(function (r) {
      e.availableCerts = r
    })
  }, e.getFirstAvailableCert = function () {
    return e.availableCerts.length > 0 ? e.availableCerts[0].id : void 0
  }, e.refreshData(), e.getAvailableCertificates(), e.showInstallGitForm = function () {
    e.appFormState.showInstallGit = !0, e.appFormState.showingAppForm = !0
  }, e.showInstallCraftForm = function () {
    e.appFormState.showInstallCraft = !0, e.appFormState.showingAppForm = !0
  }, e.showInstallWordpressForm = function () {
    e.appFormState.showInstallWordpress = !0, e.appFormState.showingAppForm = !0
  }, e.showInstallMinecraftForm = function () {
    e.appFormState.showInstallMinecraft = !0, e.appFormState.showingAppForm = !0
  }, e.installRepo = function () {
    e.repoForm.errors = [], e.repoForm.disabled = !0, r.post("/servers/" + SERVER_ID + "/sites/" + SITE_ID + "/project", {
      provider: e.repoForm.provider,
      repository: e.repoForm.name,
      branch: e.repoForm.branch,
      composer: e.repoForm.runComposer,
      migrate: e.repoForm.runMigrations
    }).success(function (r) {
      e.site = r, e.repoForm = new i
    }).error(function (r) {
      e.repoForm.errors = r, e.repoForm.disabled = !1
    })
  }, e.enableQuickDeploys = function () {
    e.deployForm.disabled = !0, r.post("/servers/" + SERVER_ID + "/sites/" + SITE_ID + "/deploy").success(function (r) {
      e.site = r, e.deployForm = new a
    })
  }, e.disableQuickDeploys = function () {
    e.deployForm.disabled = !0, r.delete("/servers/" + SERVER_ID + "/sites/" + SITE_ID + "/deploy").success(function (r) {
      e.site = r, e.deployForm = new a
    })
  }, e.editDeployScript = function () {
    e.editingDeployScript = !0, e.originalDeployScript = e.site.deploy_script
  }, e.saveDeployScript = function () {
    e.deployScriptForm.errors = [], e.deployScriptForm.disabled = !0, r.put("/servers/" + SERVER_ID + "/sites/" + SITE_ID + "/deploy/script", {script: e.site.deploy_script}).success(function (r) {
      e.site = r, e.deployScriptForm = new n, e.editingDeployScript = !1
    }).error(function (r) {
      e.deployScriptForm.errors = r, e.deployScriptForm.disabled = !1
    })
  }, e.cancelDeployScriptChanges = function () {
    e.editingDeployScript = !1, e.site.deploy_script = e.originalDeployScript
  }, e.deploySite = function () {
    e.deployButton.disabled = !0, r.post("/servers/" + SERVER_ID + "/sites/" + SITE_ID + "/deploy/now").success(function (r) {
      e.site = r
    })
  }, e.showLatestDeploymentLogModal = function () {
    e.showLatestDeploymentLogButton.disabled = !0, r.post("/servers/" + SERVER_ID + "/sites/" + SITE_ID + "/deploy/log").success(function (r) {
      e.deploymentLog = r, $("#modal-deployment-log").modal("show"), e.showLatestDeploymentLogButton.disabled = !1
    })
  }, e.resetDeploymentState = function () {
    r.put("/servers/" + SERVER_ID + "/sites/" + SITE_ID + "/deploy/reset")
  }, e.enableDeploymentNotifications = function () {
    e.hipchatForm.errors = [], e.hipchatForm.disabled = !0, r.post("/servers/" + SERVER_ID + "/sites/" + SITE_ID + "/deploy/notify", {
      hipchat_token: e.hipchatForm.token,
      hipchat_room: e.hipchatForm.room
    }).success(function (r) {
      e.site = r, e.hipchatForm = new c
    })
  }, e.disableDeploymentNotifications = function () {
    e.disableHipchatForm.disabled = !0, r.delete("/servers/" + SERVER_ID + "/sites/" + SITE_ID + "/deploy/notify").success(function (r) {
      e.site = r, e.disableHipchatForm = new d
    })
  }, e.showUninstallRepoModal = function () {
    $("#modal-uninstall-repo").modal("show")
  }, e.uninstallRepo = function () {
    e.uninstallRepoForm.disabled = !0, r.delete("/servers/" + SERVER_ID + "/sites/" + SITE_ID + "/project", {reset_migrations: e.uninstallRepoForm.rollbackMigrations}).success(function (r) {
      e.site = r, $("#modal-uninstall-repo").modal("hide"), e.uninstallRepoForm = new l, e.appFormState = new o
    })
  }, e.installCraft = function () {
    e.craftForm.errors = [], e.craftForm.disabled = !0, r.post("/servers/" + SERVER_ID + "/sites/" + SITE_ID + "/craft", {
      database: e.craftForm.database,
      password: e.craftForm.password,
      license: e.craftForm.licenseAccepted
    }).success(function (r) {
      e.site = r, e.craftForm = new u
    }).error(function (r) {
      e.craftForm.errors = r, e.craftForm.disabled = !1
    })
  }, e.showUninstallCraftModal = function () {
    $("#modal-uninstall-craft").modal("show")
  }, e.uninstallCraft = function () {
    r.delete("/servers/" + SERVER_ID + "/sites/" + SITE_ID + "/craft").success(function (r) {
      e.site = r, $("#modal-uninstall-craft").modal("hide"), e.appFormState = new o
    })
  }, e.installWordpress = function () {
    e.wordpressForm.errors = [], e.wordpressForm.disabled = !0, r.post("/servers/" + SERVER_ID + "/sites/" + SITE_ID + "/wordpress", {
      database: e.wordpressForm.database,
      password: e.wordpressForm.password
    }).success(function (r) {
      e.site = r, e.wordpressForm = new m
    }).error(function (r) {
      e.wordpressForm.errors = r, e.wordpressForm.disabled = !1
    })
  }, e.showUninstallWordpressModal = function () {
    $("#modal-uninstall-wordpress").modal("show")
  }, e.uninstallWordpress = function () {
    r.delete("/servers/" + SERVER_ID + "/sites/" + SITE_ID + "/wordpress").success(function (r) {
      e.site = r, $("#modal-uninstall-wordpress").modal("hide"), e.appFormState = new o
    })
  }, e.installMinecraft = function () {
    e.minecraftForm.errors = [], e.minecraftForm.disabled = !0, r.post("/servers/" + SERVER_ID + "/sites/" + SITE_ID + "/minecraft", {
      username: e.minecraftForm.username,
      ram: e.minecraftForm.ram
    }).success(function (r) {
      e.site = r, e.minecraftForm = new p
    }).error(function (r) {
      e.minecraftForm.errors = r, e.minecraftForm.disabled = !1
    })
  }, e.showUninstallMinecraftModal = function () {
    $("#modal-uninstall-minecraft").modal("show")
  }, e.uninstallMinecraft = function () {
    r.delete("/servers/" + SERVER_ID + "/sites/" + SITE_ID + "/minecraft").success(function (r) {
      e.site = r, $("#modal-uninstall-minecraft").modal("hide"), e.appFormState = new o
    })
  }, e.addEnvironmentVariable = function () {
    e.environmentForm.errors = [], e.environmentForm.disabled = !0, r.post("/servers/" + SERVER_ID + "/sites/" + SITE_ID + "/variable", {
      key: e.environmentForm.key,
      value: e.environmentForm.value,
      environment: e.environmentForm.environment
    }).success(function (r) {
      e.site.variables.push(r), e.environmentForm = new f
    }).error(function (r) {
      e.environmentForm.errors = r, e.environmentForm.disabled = !1
    })
  }, e.deleteEnvironmentVariable = function (s) {
    r.delete("/servers/" + SERVER_ID + "/sites/" + SITE_ID + "/variable/" + s.id), e.site.variables = _.reject(e.site.variables, function (e) {
      return e.id == s.id
    })
  }, e.addWorker = function () {
    e.workerForm.errors = [], e.workerForm.disabled = !0, r.post("/servers/" + SERVER_ID + "/sites/" + SITE_ID + "/worker", {
      connection: e.workerForm.connection,
      queue: e.workerForm.queue,
      timeout: e.workerForm.timeout,
      sleep: e.workerForm.sleep,
      tries: e.workerForm.tries,
      daemon: e.workerForm.daemon
    }).success(function (r) {
      e.site = r, e.workerForm.disabled = !1
    }).error(function (r) {
      e.workerForm.errors = r, e.workerForm.disabled = !1
    })
  }, e.showWorkerStatus = function (s) {
    e.gettingWorkerStatus = !0, r.get("/servers/" + SERVER_ID + "/sites/" + SITE_ID + "/workers/" + s.id + "/status").success(function (r) {
      e.workerStatus = r, $("#modal-worker-status").modal("show"), e.gettingWorkerStatus = !1
    })
  }, e.restartWorker = function (s) {
    r.post("/servers/" + SERVER_ID + "/sites/" + SITE_ID + "/workers/" + s.id + "/restart").success(function (r) {
      e.site = r
    })
  }, e.deleteWorker = function (s) {
    r.delete("/servers/" + SERVER_ID + "/sites/" + SITE_ID + "/workers/" + s.id), e.site.workers = _.reject(e.site.workers, function (e) {
      return e.id == s.id
    })
  }, e.createCert = function () {
    "csr" == e.newCertForm.source ? e.createCsr() : "existing" == e.newCertForm.source ? e.installExistingCert() : "clone" == e.newCertForm.source && e.cloneCert()
  }, e.createCsr = function () {
    e.newCertForm.errors = [], e.newCertForm.disabled = !0, r.post("/servers/" + SERVER_ID + "/sites/" + SITE_ID + "/csr", {
      domain: e.csrForm.domain,
      country: e.csrForm.country,
      state: e.csrForm.state,
      city: e.csrForm.city,
      organization: e.csrForm.organization,
      department: e.csrForm.department
    }).success(function (r) {
      e.site = r, e.csrForm = new w, e.newCertForm = new b
    }).error(function (r) {
      e.newCertForm.errors = r, e.newCertForm.disabled = !1
    })
  }, e.installExistingCert = function () {
    e.newCertForm.errors = [], e.newCertForm.disabled = !0, r.post("/servers/" + SERVER_ID + "/sites/" + SITE_ID + "/ssl", {
      key: e.existingCertForm.key,
      certificate: e.existingCertForm.cert
    }).success(function (r) {
      e.site = r, e.newCertForm = new b, e.existingCertForm = new v
    }).error(function (r) {
      e.newCertForm.errors = r, e.newCertForm.disabled = !1
    })
  }, e.cloneCert = function () {
    e.newCertForm.errors = [], e.newCertForm.disabled = !0, r.post("/servers/" + SERVER_ID + "/sites/" + SITE_ID + "/ssl/clone", {certificate: e.cloneCertForm.cert}).success(function (r) {
      e.site = r, e.newCertForm = new b, e.cloneCertForm = new g, e.cloneCertForm.cert = e.availableCerts[0].id
    }).error(function (r) {
      e.newCertForm.errors = r, e.newCertForm.disabled = !1
    })
  }, e.showCsrModal = function (s) {
    r.get("/servers/" + SERVER_ID + "/sites/" + SITE_ID + "/ssl/" + s.id + "/csr").success(function (r) {
      e.csrModal.csr = r, $("#modal-show-csr").modal("show")
    })
  }, e.showCertInstallModal = function (r) {
    e.certForm = new S, e.certForm.id = r.id, $("#modal-install-cert").modal("show")
  }, e.installCert = function () {
    e.certForm.errors = [], e.certForm.disabled = !0, r.post("/servers/" + SERVER_ID + "/sites/" + SITE_ID + "/ssl/" + e.certForm.id + "/crt", {certificate: e.certForm.cert}).success(function (r) {
      e.site = r, e.certForm = new S, $("#modal-install-cert").modal("hide")
    }).error(function (r) {
      e.certForm.errors = r, e.certForm.disabled = !1
    })
  }, e.activateCert = function (s) {
    e.certActivating = !0, r.post("/servers/" + SERVER_ID + "/sites/" + SITE_ID + "/ssl/" + s.id + "/activate").success(function (r) {
      e.site = r, e.certActivating = !1
    }).error(function () {
      e.certActivating = !1
    })
  }, e.deleteCert = function (s) {
    r.delete("/servers/" + SERVER_ID + "/sites/" + SITE_ID + "/ssl/" + s.id), e.site.certificates = _.reject(e.site.certificates, function (e) {
      return e.id == s.id
    })
  }, e.showEditNginxConfigModal = function () {
    e.editNginxForm = new E, r.get("/servers/" + SERVER_ID + "/sites/" + SITE_ID + "/nginx/config").success(function (r) {
      e.editNginxForm.config = r, $("#modal-edit-nginx").modal("show")
    })
  }, e.saveNginxConfig = function () {
    r.put("/servers/" + SERVER_ID + "/sites/" + SITE_ID + "/nginx/config", {config: e.editNginxForm.config}).success(function (r) {
      e.site = r, $("#modal-edit-nginx").modal("hide")
    })
  }, e.deleteSite = function () {
    $("#delete-site-btn").click()
  }
}]);
var userProfile = angular.module("controllers.UserProfile", []);
userProfile.controller("UserProfileController", ["$scope", "$http", function (e, r) {
  function s() {
    this.errors = [], this.disabled = !1
  }

  function t() {
    this.errors = [], this.disabled = !1
  }

  function o() {
    this.errors = [], this.disabled = !1
  }

  function i() {
    this.text = "", this.successful = !1, this.errors = [], this.disabled = !1
  }

  function n() {
    this.disabled = !1
  }

  function a() {
    this.name = "", this.key = "", this.errors = [], this.disabled = !1
  }

  function c() {
    this.provider = "ocean", this.name = "", this.oceanClientId = "", this.oceanApiKey = "", this.linodeApiKey = "", this.rackspaceUsername = "", this.rackspaceApiKey = "", this.awsKey = "", this.awsSecret = "", this.disabled = !1, this.errors = []
  }

  function d() {
    this.name = "", this.oceanClientId = "", this.oceanApiKey = "", this.linodeApiKey = "", this.rackspaceUsername = "", this.rackspaceApiKey = "", this.awsKey = "", this.awsSecret = "", this.disabled = !1, this.errors = []
  }

  function l() {
    this.disabled = !1, this.errors = []
  }

  function u() {
    this.disabled = !1
  }

  function m() {
    this.oldPassword = "", this.password = "", this.passwordConfirmation = "", this.disabled = !1, this.errors = []
  }

  function p() {
    this.country = "", this.cell = "", this.disabled = !1, this.errors = []
  }

  function f() {
    this.disabled = !1
  }

  e.userLoaded = !1, e.authEnabled = !1, e.passwordUpdated = !1, e.gettingReconnectKey = !1, e.keyForm = new a, e.tokenForm = new u, e.cancelForm = new n, e.resumeForm = new t, e.passwordForm = new m, e.subscribeForm = new s, e.credentialForm = new c, e.updateCardForm = new o, e.enableAuthForm = new p, e.disableAuthForm = new f, e.extraBillingForm = new i, e.editCredentialForm = new d, e.deleteCredentialForm = new l, e.refreshData = function () {
    r.get("/api/user").success(function (r) {
      e.user = r, e.extraBillingForm.text = r.vat, e.enableAuthForm.country = r.country, e.enableAuthForm.cell = r.cell, e.userLoaded = !0
    }), r.get("/api/servers/revoked").success(function (r) {
      e.revokedServers = r
    })
  }, e.refreshData(), Stripe.setPublishableKey(STRIPE_KEY), e.subscribe = function () {
    e.removeSubscriptionErrors(), e.subscribeForm.disabled = !0, Stripe.card.createToken($("#payment-form"), function (s, t) {
      t.error ? (e.subscribeForm.errors.push(t.error.message), e.subscribeForm.disabled = !1, e.$apply()) : r.post("/user/subscribe", {stripe_token: t.id}).success(function (r) {
        e.user = r, e.subscriptionUpdated = !0, e.subscribeForm.disabled = !1, e.$apply()
      })
    })
  }, e.resumeSubscription = function () {
    e.removeSubscriptionErrors(), e.resumeForm.disabled = !0, Stripe.card.createToken($("#payment-form"), function (s, t) {
      t.error ? (e.resumeForm.errors.push(t.error.message), e.resumeForm.disabled = !1, e.$apply()) : r.post("/user/resume", {stripe_token: t.id}).success(function (r) {
        e.user = r, e.subscriptionUpdated = !0, e.resumeForm.disabled = !1, e.$apply()
      })
    })
  }, e.updateCard = function () {
    e.removeSubscriptionErrors(), e.updateCardForm.disabled = !0, Stripe.card.createToken($("#payment-form"), function (s, t) {
      t.error ? (e.updateCardForm.errors.push(t.error.message), e.updateCardForm.disabled = !1, e.$apply()) : r.put("/user/card", {stripe_token: t.id}).success(function (r) {
        e.user = r, e.subscriptionUpdated = !0, e.updateCardForm.disabled = !1, e.$apply()
      })
    })
  }, e.saveExtraBillingInformation = function () {
    e.extraBillingForm.errors = [], e.extraBillingForm.disabled = !0, e.extraBillingForm.successful = !1, r.put("/user/vat", {text: e.extraBillingForm.text}).success(function (r) {
      e.user = r, e.extraBillingForm.disabled = !1, e.extraBillingForm.successful = !0
    }).error(function (r) {
      e.extraBillingForm.errors = r, e.extraBillingForm.disabled = !1
    })
  }, e.showCancelSubscriptionModal = function () {
    $("#modal-cancel-subscription").modal("show")
  }, e.cancelSubscription = function () {
    e.removeSubscriptionErrors(), e.cancelForm.disabled = !0, e.subscriptionUpdated = !1, r.post("/user/account/close").success(function (r) {
      e.user = r, e.cancelForm.disabled = !1, $("#modal-cancel-subscription").modal("hide")
    })
  }, e.removeSubscriptionErrors = function () {
    e.subscribeForm.errors = [], e.resumeForm.errors = [], e.updateCardForm.errors = [], e.subscriptionUpdated = !1
  }, e.addKey = function () {
    e.keyForm.errors = [], e.keyForm.disabled = !0, r.post("/user/key", {
      name: e.keyForm.name,
      key: e.keyForm.key
    }).success(function (r) {
      e.user.keys.push(r), e.keyForm = new a
    }).error(function (r) {
      e.keyForm.errors = r, e.keyForm.disabled = !1
    })
  }, e.deleteKey = function (s) {
    r.delete("/user/key/" + s.id), e.user.keys = _.reject(e.user.keys, function (e) {
      return s.id == e.id
    })
  }, e.showReconnectModal = function (s) {
    e.gettingReconnectKey = !0, e.reconnectingServer = s, r.post("/servers/" + s.id + "/reconnect").success(function (r) {
      e.reconnectKey = r, $("#modal-reconnect").modal("show"), e.gettingReconnectKey = !1
    })
  }, e.reactivateServer = function () {
    r.post("/servers/" + e.reconnectingServer.id + "/reactivate").success(function (r) {
      e.revokedServers = r, e.reconnectingServer = null, $("#modal-reconnect").modal("hide")
    })
  }, e.createCredential = function () {
    switch (e.credentialForm.provider) {
      case"ocean":
        e.addOceanCredential();
        break;
      case"linode":
        e.addLinodeCredential();
        break;
      case"rackspace":
        e.addRackspaceCredential();
        break;
      case"aws":
        e.addAwsCredential()
    }
  }, e.addOceanCredential = function () {
    e.doCreateCredential("/api/user/credentials/ocean", {
      ocean_client_id: e.credentialForm.oceanClientId,
      ocean_api_key: e.credentialForm.oceanApiKey
    })
  }, e.addLinodeCredential = function () {
    e.doCreateCredential("/api/user/credentials/linode", {linode_api_key: e.credentialForm.linodeApiKey})
  }, e.addRackspaceCredential = function () {
    e.doCreateCredential("/api/user/credentials/rackspace", {
      rackspace_username: e.credentialForm.rackspaceUsername,
      rackspace_api_key: e.credentialForm.rackspaceApiKey
    })
  }, e.addAwsCredential = function () {
    e.doCreateCredential("/api/user/credentials/aws", {
      aws_key: e.credentialForm.awsKey,
      aws_secret: e.credentialForm.awsSecret
    })
  }, e.doCreateCredential = function (s, t) {
    e.credentialForm.errors = [], e.credentialForm.disabled = !0, t.name = e.credentialForm.name, r.post(s, t).success(function (r) {
      e.user = r, e.credentialForm = new c
    }).error(function (r) {
      e.credentialForm.errors = r, e.credentialForm.disabled = !1
    })
  }, e.showEditCredentialModal = function (r) {
    switch (e.editCredentialForm = new d, e.editingCredential = r, e.editCredentialForm.name = r.name, r.type) {
      case"ocean":
        e.editCredentialForm.oceanClientId = r.ocean_client_id;
        break;
      case"rackspace":
        e.editCredentialForm.rackspaceUsername = r.rackspace_username;
        break;
      case"aws":
        e.editCredentialForm.awsKey = r.aws_key
    }
    $("#modal-edit-credential").modal("show")
  }, e.editCredential = function () {
    switch (e.editingCredential.type) {
      case"ocean":
        e.updateOceanCredential(e.editingCredential);
        break;
      case"linode":
        e.updateLinodeCredential(e.editingCredential);
        break;
      case"rackspace":
        e.updateRackspaceCredential(e.editingCredential);
        break;
      case"aws":
        e.updateAwsCredential(e.editingCredential)
    }
  }, e.updateOceanCredential = function (r) {
    e.doUpdateCredential("/api/user/credentials/" + r.id + "/ocean", {
      ocean_client_id: e.editCredentialForm.oceanClientId,
      ocean_api_key: e.editCredentialForm.oceanApiKey
    })
  }, e.updateLinodeCredential = function (r) {
    e.doUpdateCredential("/api/user/credentials/" + r.id + "/linode", {linode_api_key: e.editCredentialForm.linodeApiKey})
  }, e.updateRackspaceCredential = function (r) {
    e.doUpdateCredential("/api/user/credentials/" + r.id + "/rackspace", {
      rackspace_username: e.editCredentialForm.rackspaceUsername,
      rackspace_api_key: e.editCredentialForm.rackspaceApiKey
    })
  }, e.updateAwsCredential = function (r) {
    e.doUpdateCredential("/api/user/credentials/" + r.id + "/aws", {
      aws_key: e.editCredentialForm.awsKey,
      aws_secret: e.editCredentialForm.awsSecret
    })
  }, e.doUpdateCredential = function (s, t) {
    e.editCredentialForm.errors = [], e.editCredentialForm.disabled = !0, t.name = e.editCredentialForm.name, r.put(s, t).success(function (r) {
      e.user = r, e.editCredentialForm.disabled = !1, $("#modal-edit-credential").modal("hide")
    }).error(function (r) {
      e.editCredentialForm.errors = r, e.editCredentialForm.disabled = !1
    })
  }, e.showDeleteCredentialModal = function (r) {
    e.deletingCredential = r, $("#modal-delete-credential").modal("show")
  }, e.deleteCredential = function () {
    e.deleteCredentialForm.errors = [], e.deleteCredentialForm.disabled = !0, r.delete("/api/user/credentials/" + e.deletingCredential.id).success(function (r) {
      e.user = r, $("#modal-delete-credential").modal("hide"), e.deleteCredentialForm = new l
    }).error(function (r) {
      e.deleteCredentialForm.errors = r, e.deleteCredentialForm.disabled = !1
    })
  }, e.disconnectFromOcean = function () {
    r.delete("/api/user/credentials/ocean").success(function () {
      e.refreshData()
    })
  }, e.disconnectFromLinode = function () {
    r.delete("/api/user/credentials/linode").success(function () {
      e.refreshData()
    })
  }, e.disconnectFromRackspace = function () {
    r.delete("/api/user/credentials/rackspace").success(function () {
      e.refreshData()
    })
  }, e.disconnectFromAws = function () {
    r.delete("/api/user/credentials/aws").success(function () {
      e.refreshData()
    })
  }, e.refreshForgeToken = function () {
    e.tokenForm.disabled = !0, r.put("/user/token").success(function (r) {
      e.user = r, e.tokenForm.disabled = !1
    })
  }, e.updatePassword = function () {
    e.passwordUpdated = !1, e.passwordForm.errors = [], e.passwordForm.disabled = !0, r.put("/user/password", {
      old_password: e.passwordForm.oldPassword,
      password: e.passwordForm.password,
      password_confirmation: e.passwordForm.passwordConfirmation
    }).success(function (r) {
      e.user = r, e.passwordForm = new m, e.passwordUpdated = !0
    }).error(function (r) {
      e.passwordForm.errors = r, e.passwordForm.disabled = !1
    })
  }, e.enableTwoFactorAuth = function () {
    e.authEnabled = !1, e.enableAuthForm.errors = [], e.enableAuthForm.disabled = !0, r.post("/user/authy/enable", {
      country: e.enableAuthForm.country,
      cell: e.enableAuthForm.cell
    }).success(function (r) {
      e.user = r, e.authEnabled = !0, e.enableAuthForm.errors = [], e.enableAuthForm.disabled = !1
    }).error(function (r) {
      e.enableAuthForm.errors = r, e.enableAuthForm.disabled = !1
    })
  }, e.disableTwoFactorAuth = function () {
    e.authEnabled = !1, e.disableAuthForm.disabled = !0, r.post("/user/authy/disable").success(function () {
      e.refreshData(), e.disableAuthForm = new f
    })
  }
}]);