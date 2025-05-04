package defsu.system.projects.sys.forms.test;

import defsu.system.projects.TestService;
import defsu.system.server.components.Button;
import defsu.system.server.components.C;
import defsu.system.server.components.WindowForm;
import defsu.system.server.core.SuResponse;
import defsu.system.server.utils.ModuleUtils;

public class TestForm extends WindowForm {

    public TestForm(){
        super(C.id("TestForm"), C.title("Test Form123123123123"), C.items(
                new Button().addService(TestService.class).width(600).addFormMethod("test").id("testb").text("TEXT").addListener(new ComponentListener(ListenerType.STOPEDIT, "stopEdit")),
                new Button().addService(TestService.class).addFormMethod("test2").id("testb2").text("TEXT"),
                new Button().addService(TestService.class).addFormMethod("test3").id("testb3").text("TEXT")
        ));
        setStatefull(true);
    }

    public SuResponse test(TestForm form){
        SuResponse response = new SuResponse();
        //boolean c = ModuleUtils.confirmMessage("TEST", "TEST");
        //response.getMessages().add(ModuleUtils.errorMessage("TEST", "TEST"));

        ModuleUtils.sendSuccessMessage("TEST BAŞARILI", "BAŞARILI");

        SuResponse.ModuleInitiator init = new SuResponse.ModuleInitiator();
        init.className = TestService.class.getName();
        init.form = "selector";
        response.setModuleInitiator(init);


        return response;
    }

    public static class Selector extends WindowForm{
        public Selector(){
            super(C.id("TestForm-Selector"), C.width(800), C.width(600), C.title("Test Form Selector"), C.items(
                    new Button().addService(TestService.class).addFormMethod("test").id("testbselector").text("TEXT")
            ));
            setStatefull(false);
        }
    }

}
