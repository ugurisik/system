package defsu.system.server.utils;

import defsu.system.server.components.SynchConfirm;
import defsu.system.server.core.WSUpdateCore;
import defsu.system.server.helpers.InteractionMessage;

public class ModuleUtils {
    public static InteractionMessage errorMessage(String title, String m) {
        InteractionMessage message = new InteractionMessage();
        message.title = title;
        message.message = m;
        message.type = Enums.InteractionMessageType.ERROR;
        return message;
    }

    public static boolean confirmMessage( String title,String text) {
        SynchConfirm confirm = new SynchConfirm(title, text);
        return confirm.interact();
    }

    public static InteractionMessage successMessage(String title, String m) {
        new InteractionMessage();
        InteractionMessage message = new InteractionMessage();
        message.title = title;
        message.message = m;
        message.type = Enums.InteractionMessageType.SUCCESS;
        return message;
    }

    public static void sendSuccessMessage(String title, String m) {
        WSUpdateCore.Payload p = new WSUpdateCore.Payload();
        p.messages.add(successMessage(title, m));
        WSUpdateCore.sendToSession(p);
    }
}
