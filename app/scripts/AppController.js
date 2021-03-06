/*jshint browser: true, node: true, unused: false*/
/*global prepros,  _ */

//App controller
prepros.controller('AppCtrl', function ($scope, $rootScope, $route, $routeParams, $location, storage,
                                        projectsManager, liveRefresh, watcher, utils, config) {

    'use strict';

    //Files and projects
    $scope.projects = projectsManager.projects;

    $scope.files = projectsManager.files;

    $scope.imports = projectsManager.imports;

    $scope.selectedFile = [];

    $scope.selectedProject = [];

    $rootScope.$broadcast('initServices', {
        projects: $scope.projects,
        files: $scope.files,
        imports: $scope.imports
    });

    function dataChange(data){
        $scope.projects = data.projects;
        $scope.files = data.files;
        $scope.imports = data.imports;

        //Check if selectedProject was removed from project list
        if ($scope.selectedProject.id && !_.findWhere($scope.projects, {id: $scope.selectedProject.id})) {

            $scope.selectedProject = [];
            $location.path('/home');
        }

        //Check if selectedFile was removed from files list
        if ($scope.selectedFile.id) {
            if (!_.findWhere($scope.files, {id: $scope.selectedFile.id})) {

                $scope.selectedFile = [];

                //If project exists
                if ($scope.selectedProject.id) {
                    $location.path('/files/' + $scope.selectedProject.id);
                }
            }
        }
    }

    $scope.$on('dataChange', function (event, data) {

        //Force view update if it is not updated automatically
        if (!$scope.$$phase){
            $scope.$apply(function(){
                dataChange(data);
            });
        } else {
            dataChange(data);
        }

    });

    $scope.$on('$routeChangeSuccess', function () {

        //Get path from route
        $scope.routePath = $route.current.routePath;

        //If url contains project id
        if ($routeParams.pid) {

            $scope.pid = $routeParams.pid;

            //If project id in the url is in the projects list
            if (!_.isEmpty(_.findWhere($scope.projects, {id: $routeParams.pid}))) {

                $scope.selectedProject = _.findWhere($scope.projects, {id: $routeParams.pid});

                //If url contains file id
                if ($routeParams.fid) {

                    //If file id is in the file list
                    if (!_.isEmpty(_.findWhere($scope.files, {id: $routeParams.fid}))) {

                        $scope.selectedFile = _.findWhere($scope.files, {id: $routeParams.fid});

                        //If file is ot in the file list redirect to project files list
                    } else {

                        $location.path('/files/' + $scope.selectedProject.id);

                    }
                } else {

                    $scope.selectedFile = {};
                }

                //If project id is not in the list redirect to home
            } else {

                $location.path('/home');

            }
        } else {

            $scope.selectedProject = [];
        }
    });

    //Save data on exit
    require('nw.gui').Window.get().on('close', function () {
        this.hide();
        //Save application state url
        localStorage.stateUrl = window.location.hash;
        storage.saveFiles($scope.files);
        storage.saveImports($scope.imports);
        storage.saveProjects($scope.projects);
    });
});