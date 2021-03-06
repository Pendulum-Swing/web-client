import { Injectable }         from '@angular/core';
import { Action }             from '@ngrx/store';
import { Status }             from './status.model';
import { ActionWithPayload }  from '../action-with-payload';

@Injectable()
export class StatusActions {
  static LOAD_STATUS = 'LOAD_STATUS';
  static UPDATE_NET_STATUS = 'UPDATE_NET_STATUS';
  static UPDATE_IS_LOGIN  = 'UPDATE_IS_LOGIN';
  static UPDATE_STATUS = 'UPDATE_STATUS';
  static CLEAR_STATUS = 'CLEAR_STATUS';

  loadStatus(netStatus: Status): ActionWithPayload<Status> {
    return {
      type: StatusActions.LOAD_STATUS,
      payload: netStatus
    };
  }

  updateNetStatus(netStatus: boolean):  ActionWithPayload<boolean> {
    return {
      type: StatusActions.UPDATE_NET_STATUS,
      payload: netStatus
    };
  }

  updateIsLogin(isLogin: boolean):  ActionWithPayload<boolean> {
    return {
      type: StatusActions.UPDATE_IS_LOGIN,
      payload: isLogin
    };
  }

  updateStatus(status: Partial<Status>): ActionWithPayload<Partial<Status>> {
    return {
      type: StatusActions.UPDATE_STATUS,
      payload: status
    }
  }

  clearStatus(): Action {
    return {
      type: StatusActions.CLEAR_STATUS
    };
  }
}
