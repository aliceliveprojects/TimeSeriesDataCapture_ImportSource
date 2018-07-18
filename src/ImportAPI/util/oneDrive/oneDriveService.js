'use strict';


const httpRequest = require('../http/httpRequest');
var oneDriveToken = 'EwBYA8l6BAAURSN/FHlDW5xN74t6GzbtsBBeBUYAAcrtJPLsUEMnhleogxBTgqLaKA6isB30oubqW7YUtUau1KI9ZEvFoAetlXE8+YTbl9AvKPIHUXtkpbThsh1EpOzs3damIW3xjXIT7r4aG+f7kqcXRuT4vsscX5icwoSdkyZKOS2swrR66AaowaZC9eZ6euBPmCCjAOl5IkN1Wl6uUOwYhOYBW9b31mSA9el9BLuhWPl5BE+PWbo9g+wxApHaB6UUOKT5zh2Cw8F+vZg1eRWqHNswrO+yoSNidtzdNXUYZ/lUpY9ptIGd9sqMqKlYKeAWNfomBqoDEnygadN9azlLkOhvjbSs6F7LmZ7bXYLwGATwIk8z2fNfCOR7gnMDZgAACPdLasOKhEOEKAJ+SLnH5I/sRMEuyv+aCKPQH2jgXreS6pa6CnQ64vSSb8xVwTnrDEMP45S0kZ1/s4BH/F0TJbv4cG5gQJuW3y0kQVnxBvxy+BXsQbR9a1rkBELlTUgRj5TrfTaa/5cDoI3jX2Z1V/4YJkGzMmFKEYHWRRYf9UHIfVlJd9RKTdDAB7i1c+dtoLKsir2/4LnFG5sHLwoiwML+S//1CqNuD8xO0qwvBMGpsfjiMMktWxzCf+0kqDDTSG4LBs5ucFl/eq5O1mdbRUUDwGgyitNw4dApP/CO/4U3Hyp3sozGTRpPSj7oJ4XYwS0xm3o1cYsb+cxkvh+yfUWHG7cU7kPFe0yWXqva3EhyGHv2C0QyN8Eazduxl89bU6c5mNp+ylmhFTwNWwyaCSGlNxaNMdYCZ0g5cKPxzM/cic83+ckQjEJQdPn+rVo9wPY6gmXOxxG8TUGUmMGjm90NywO99OIHwnR+uIkLH5UT5FhnJGiWqn7JX8P3oSE6MkyjVyCv8uiAg6N5pXFUhhOV8q4y9JTfr1suQfMCUQh+SmkPCW4J6Xcpqkc/p5ZpDTAgTfWzjQ5/SMnN9B00ceM6EXERHltHFtP2OH8+iFVxD0RbZcLqQoRHs+fI6k7WMhYRogAOG7bTmLHrA7xpnE8L6n8huI7WvTRlnF9464NI3HG1GhtNKuc3CFOM9+tcIwTZF2nHQks4lPIYJ1eagPMBkgAUH/EmrMMhBiNguK1KI7FmAg=='

function parseComponentIds(data){
    var result = {
        folders: []
    }

    data.value.forEach(folder => {

        if(folder.hasOwnProperty('folder')){
            result.folders.push({
                id: folder.id,
                name: folder.name
            }) 
        }
     
    });

    return result;
} 

exports.getComponentIDs = function (folderID){
    return new Promise(function(resolve,reject){
        var options = {
            protocol: 'https:',
          host: 'graph.microsoft.com',
            path:'/v1.0/me/drive/root/children',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'bearer ' + oneDriveToken
        }
        };
    
        httpRequest.httpRequest(options)
        .then((result) =>{
            result = JSON.parse(result);
            console.log(result);
            resolve((result));
        })
        .catch((error) =>{
            reject(error);
        })
    });
    
}

exports.getComponent = async function(){

}

