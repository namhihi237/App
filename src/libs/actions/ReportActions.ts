import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import * as ReportActionUtils from '../ReportActionsUtils';
import * as ReportUtils from '../ReportUtils';
import ReportAction, {Message} from '../../types/onyx/ReportAction';
import * as Localize from "../Localize"

function clearReportActionErrors(reportID: string, reportAction: ReportAction) {
    const originalReportID = ReportUtils.getOriginalReportID(reportID, reportAction);

    if (!reportAction.reportActionID) {
        return;
    }

    if (reportAction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        // Delete the optimistic action
        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`, {
            [reportAction.reportActionID]: null,
        });

        // If there's a linked transaction, delete that too
        const linkedTransactionID = ReportActionUtils.getLinkedTransactionID(originalReportID, reportAction.reportActionID);
        if (linkedTransactionID) {
            Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${linkedTransactionID}`, null);
        }

        return;
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`, {
        [reportAction.reportActionID]: {
            errors: null,
        },
    });
}

/**
 * @param originalMessage
 * @param targetAccountIDs
 * @returns
 */
function getReportActionMessageRoomChange(originalMessage: Message, targetAccountIDs: number[]) {
    if (targetAccountIDs.length === 0) {
        return originalMessage;
    }

    const mentionTags = targetAccountIDs.map((accountID, index) => {
        if (index === targetAccountIDs.length - 1) {
            return `${Localize.translateLocal('common.and')} <mention-user accountID=${accountID}></mention-user>`;
        }
        return `<mention-user accountID=${accountID}></mention-user>, `;
    });

    const html = `<muted-text>${Localize.translateLocal('common.invited')} ${mentionTags.join("")} </muted-text>`;

    const message: Message = {
        ...originalMessage,
        html
    };

    return message;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    clearReportActionErrors,
    getReportActionMessageRoomChange
};
