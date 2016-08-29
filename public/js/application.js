(function() {
angular.module('MyApp', ['ngRoute', 'satellizer'])
  .config(["$routeProvider", "$locationProvider", "$authProvider", function($routeProvider, $locationProvider, $authProvider) {
    skipIfAuthenticated.$inject = ["$location", "$auth"];
    loginRequired.$inject = ["$location", "$auth"];
    $locationProvider.html5Mode(true);

    $routeProvider
      .when('/', {
        templateUrl: 'partials/home.html'
      })
      .when('/contact', {
        templateUrl: 'partials/contact.html',
        controller: 'ContactCtrl'
      })
      .when('/login', {
        templateUrl: 'partials/login.html',
        controller: 'LoginCtrl',
        resolve: { skipIfAuthenticated: skipIfAuthenticated }
      })
      .when('/signup', {
        templateUrl: 'partials/signup.html',
        controller: 'SignupCtrl',
        resolve: { skipIfAuthenticated: skipIfAuthenticated }
      })
      .when('/account', {
        templateUrl: 'partials/profile.html',
        controller: 'ProfileCtrl',
        resolve: { loginRequired: loginRequired }
      })
      .when('/forgot', {
        templateUrl: 'partials/forgot.html',
        controller: 'ForgotCtrl',
        resolve: { skipIfAuthenticated: skipIfAuthenticated }
      })
      .when('/reset/:token', {
        templateUrl: 'partials/reset.html',
        controller: 'ResetCtrl',
        resolve: { skipIfAuthenticated: skipIfAuthenticated }
      })
      .otherwise({
        templateUrl: 'partials/404.html'
      });

    $authProvider.loginUrl = '/login';
    $authProvider.signupUrl = '/signup';

    function skipIfAuthenticated($location, $auth) {
      if ($auth.isAuthenticated()) {
        $location.path('/');
      }
    }

    function loginRequired($location, $auth) {
      if (!$auth.isAuthenticated()) {
        $location.path('/login');
      }
    }
  }])
  .run(["$rootScope", "$window", function($rootScope, $window) {
    if ($window.localStorage.user) {
      $rootScope.currentUser = JSON.parse($window.localStorage.user);
    }
    console.log('run')
  }]);
})();

(function() {
angular.module('MyApp')
    .controller('ContactCtrl', ContactCtrl);

ContactCtrl.$inject = ['$scope', 'Contact'];

function ContactCtrl($scope, Contact) {
    var ctrl = this;
    ctrl.sendContactForm = sendContactForm;

    function sendContactForm() {
        Contact.send($scope.contact)
            .then(function(response) {
                $scope.messages = {
                    success: [response.data]
                };
            })
            .catch(function(response) {
                $scope.messages = {
                    error: Array.isArray(response.data) ? response.data : [response.data]
                };
            });
    }
}
})();

(function() {
angular.module('MyApp')
    .controller('ForgotCtrl', ForgotCtrl);

ForgotCtrl.$inject = ['$scope', 'Account'];

function ForgotCtrl($scope, Account) {
    var ctrl = this;
    ctrl.forgotPassword = forgotPassword;

    function forgotPassword() {
        Account.forgotPassword($scope.user)
          .then(function(response) {
            $scope.messages = {
              success: [response.data]
            };
          })
          .catch(function(response) {
            $scope.messages = {
              error: Array.isArray(response.data) ? response.data : [response.data]
            };
          });
    }
}
})();

(function() {
angular.module('MyApp')
    .controller('HeaderCtrl', HeaderCtrl);

HeaderCtrl.$inject = ['$scope', '$location', '$window', '$auth'];

function HeaderCtrl($scope, $location, $window, $auth) {
    var ctrl = this;
    ctrl.isActive = isActive;
    ctrl.isAuthenticated = isAuthenticated;
    ctrl.logout = logout;

    function isActive(viewLocation) {
        return viewLocation === $location.path();
    }

    function isAuthenticated() {
        return $auth.isAuthenticated();
    }

    function logout() {
        $auth.logout();
        delete $window.localStorage.user;
        $location.path('/');
    }

}
})();

(function() {
angular.module('MyApp')
    .controller('LoginCtrl', LoginCtrl);

LoginCtrl.$inject = ['$scope', '$rootScope', '$location', '$window', '$auth'];

function LoginCtrl($scope, $rootScope, $location, $window, $auth) {
    var ctrl = this;
    ctrl.login = login;
    ctrl.authenticate = authenticate;

    function login() {
        $auth.login($scope.user)
          .then(function(response) {
            $rootScope.currentUser = response.data.user;
            $window.localStorage.user = JSON.stringify(response.data.user);
            $location.path('/account');
          })
          .catch(function(response) {
            $scope.messages = {
              error: Array.isArray(response.data) ? response.data : [response.data]
            };
          });
    }

    function authenticate(provider) {
        $auth.authenticate(provider)
          .then(function(response) {
            $rootScope.currentUser = response.data.user;
            $window.localStorage.user = JSON.stringify(response.data.user);
            $location.path('/');
          })
          .catch(function(response) {
            if (response.error) {
              $scope.messages = {
                error: [{ msg: response.error }]
              };
            } else if (response.data) {
              $scope.messages = {
                error: [response.data]
              };
            }
          });
    }
}
})();

(function() {
angular.module('MyApp')
    .controller('ContactCtrl', ContactCtrl);

ContactCtrl.$inject = ['$scope', '$rootScope', '$location', '$window', '$auth', 'Account'];

function ContactCtrl($scope, $rootScope, $location, $window, $auth, Account) {
    var ctrl = this;
    ctrl.updateProfile = updateProfile;
    ctrl.changePassword = changePassword;
    ctrl.link = link;
    ctrl.unlink = unlink;
    ctrl.deleteAccount = deleteAccount;
    ctrl.unlink = unlink;
    $scope.profile = $rootScope.currentUser;

    function updateProfile() {
        Account.updateProfile($scope.profile)
          .then(function(response) {
            $rootScope.currentUser = response.data.user;
            $window.localStorage.user = JSON.stringify(response.data.user);
            $scope.messages = {
              success: [response.data]
            };
          })
          .catch(function(response) {
            $scope.messages = {
              error: Array.isArray(response.data) ? response.data : [response.data]
            };
          });
    }

    function changePassword() {
        Account.changePassword($scope.profile)
          .then(function(response) {
            $scope.messages = {
              success: [response.data]
            };
          })
          .catch(function(response) {
            $scope.messages = {
              error: Array.isArray(response.data) ? response.data : [response.data]
            };
          });
    }

    function link(provider) {
        $auth.link(provider)
          .then(function(response) {
            $scope.messages = {
              success: [response.data]
            };
          })
          .catch(function(response) {
            $window.scrollTo(0, 0);
            $scope.messages = {
              error: [response.data]
            };
          });
    }

    function unlink(provider) {
        $auth.unlink(provider)
          .then(function() {
            $scope.messages = {
              success: [response.data]
            };
          })
          .catch(function(response) {
            $scope.messages = {
              error: [response.data]
            };
          });
    }

    function deleteAccount() {
        $scope.deleteAccount = function() {
          Account.deleteAccount()
            .then(function() {
              $auth.logout();
              delete $window.localStorage.user;
              $location.path('/');
            })
            .catch(function(response) {
              $scope.messages = {
                error: [response.data]
              };
            });
        };
    }
}
})();

(function() {
  angular.module('MyApp')
      .controller('ResetCtrl', ResetCtrl);

  ResetCtrl.$inject = ['$scope', 'Account'];

  function ResetCtrl($scope, Account) {
      var ctrl = this;
      ctrl.resetPassword = resetPassword;

      function resetPassword() {
          Account.resetPassword($scope.user)
            .then(function(response) {
              $scope.messages = {
                success: [response.data]
              };
            })
            .catch(function(response) {
              $scope.messages = {
                error: Array.isArray(response.data) ? response.data : [response.data]
              };
            });
      }
  }
  })();

(function() {
angular.module('MyApp')
    .controller('SignupCtrl', SignupCtrl);

SignupCtrl.$inject = ['$scope', '$rootScope', '$location', '$window', '$auth'];

function SignupCtrl($scope, $rootScope, $location, $window, $auth) {
    var ctrl = this;
    ctrl.signup = signup;
    ctrl.authenticate = authenticate;

    function signup() {
        $auth.signup($scope.user)
          .then(function(response) {
            $auth.setToken(response);
            $rootScope.currentUser = response.data.user;
            $window.localStorage.user = JSON.stringify(response.data.user);
            $location.path('/');
          })
          .catch(function(response) {
            $scope.messages = {
              error: Array.isArray(response.data) ? response.data : [response.data]
            };
          });
    }

    function authenticate(provider) {
        $auth.authenticate(provider)
          .then(function(response) {
            $rootScope.currentUser = response.data.user;
            $window.localStorage.user = JSON.stringify(response.data.user);
            $location.path('/');
          })
          .catch(function(response) {
            if (response.error) {
              $scope.messages = {
                error: [{ msg: response.error }]
              };
            } else if (response.data) {
              $scope.messages = {
                error: [response.data]
              };
            }
          });
    }

}
})();

(function() {
  angular.module('MyApp')
      .factory('Account', Account);

  Account.$inject = ['$http'];

  function Account($http) {
      return {
        updateProfile: function(data) {
          return $http.put('/account', data);
        },
        changePassword: function(data) {
          return $http.put('/account', data);
        },
        deleteAccount: function() {
          return $http.delete('/account');
        },
        forgotPassword: function(data) {
          return $http.post('/forgot', data);
        },
        resetPassword: function(data) {
          return $http.post('/reset', data);
      }
    };
  }
})();

(function() {
angular.module('MyApp')
    .factory('Contact', Contact);

Contact.$inject = ['$http'];

function Contact($http) {
    return {
      send: function(data) {
        return $http.post('/contact', data);
      }
    };
}
})();
