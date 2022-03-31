// def Custome Service
let MyModuleMyService;
import BaseService from 'scripts/BaseClasses/BaseService.coffee';

// export custom data service class
export default MyModuleMyService = class MyModuleMyService extends BaseService {
  initialize() {}
  showAlert() {
    return alert('This is a message.');
  }
};
