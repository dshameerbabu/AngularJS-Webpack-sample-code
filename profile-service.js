/**
 * Created by Shameer.d on 30-12-2015.
 */

/**
 * Parse and format the data
 * @param data
 * @returns {*}
 */
function parse(data) {
    return data.d;
}

export default function ProfileService($resource, $q, $log, AppConstants, AppEndPointsService) {
    'ngInject';

    var self = this;
    var url, profileModel, profileData, fetchPromise;

    function setConfigurations(){
        AppConstants.currentClassId = AppConstants.currentClassId ||
            (profileData.ClassroomCourses && profileData.ClassroomCourses[0].ClassroomID);
    }

    function getCurrentClass(){
        var currentClass;
        _.each(profileData.ClassroomCourses, function(c){
            if(c.ClassroomID == AppConstants.currentClassId){
                currentClass = c;
            }
        });
        return currentClass;
    };

    this.fetch = function (force) {
        if (!force && !_.isEmpty(profileData)) {
            return $q.resolve(profileData);
        }

        if (!url) {
            url = AppEndPointsService.get(AppConstants.getApiKey().profile);
            if (!url) {
                $log.error('Api end point urls not found!');
                //TODO: need to fetch the api urls
            }

            url += '/GetHeader';
        }

        if (_.isEmpty(url)) {
            throw "Profile api url is not provided.";
        }

        if (!profileModel) {
            profileModel = $resource(url, {}, {
                fetchProfile: {method: 'post', isArray: false, cancellable: true}
            });
        }

        if (force || !fetchPromise) {
            var params = {};
            fetchPromise = profileModel.fetchProfile(params).$promise.then(function (data) {
                profileData = parse(data);
                setConfigurations();
                fetchPromise = null;
                return $q.resolve(profileData);
            }, function (error) {
                fetchPromise = null;
                return $q.reject(error);
            });
        }

        return fetchPromise;
    };

    this.getProfileData = function () {
        return profileData;
    };

    this.getDefaultClass = function() {
        return profileData.ClassroomCourses[0];
    };

    this.getCurrentClass = function(){
        return getCurrentClass();
    };

    this.getDashboardData = function (){
        var currentClass = getCurrentClass();
        return {
            fullDisplayName : profileData.FullDisplayName,
            classroomName : currentClass.ClassroomName,
            classroomCourses : profileData.ClassroomCourses
        };
    };

    this.reload = function (callback) {
        callback(self.fetch(true));
    };

    this.getFaceMakerData = function () {
        var faceMakerData = {faceSettings: '', countryCode: ''};
        faceMakerData.faceSettings = profileData && profileData.FaceSetting;
        faceMakerData.countryCode = profileData && profileData.CountryCode;
        return faceMakerData;
    };

}

