import Onyx from 'react-native-onyx';
import * as ReportActionUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ReportAction, {Message} from '@src/types/onyx/ReportAction';
import * as Localize from "@libs/Localize"

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
        if (index === targetAccountIDs.length - 1 && index !== 0) {
            return `${Localize.translateLocal('common.and')} <mention-user accountID=${accountID}></mention-user>`;
        }
        return `<mention-user accountID=${accountID}></mention-user>${targetAccountIDs.length > 1 ? ', ' : ''}`;
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
