package alba.system.server.utils;

import alba.system.server.components.SynchConfirm;
import alba.system.server.helpers.InteractionMessage;

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
}
