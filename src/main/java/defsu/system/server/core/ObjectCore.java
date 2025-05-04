package defsu.system.server.core;

import defsu.system.SystemApplication;
import defsu.system.projects.sys.record.Manipulationlog;
import defsu.system.projects.sys.record.User;
import defsu.system.server.auth.Permission;
import defsu.system.server.components.*;
import defsu.system.server.helpers.*;
import defsu.system.server.components.*;
import defsu.system.server.helpers.*;
import defsu.system.server.helpers.Record;
import defsu.system.server.utils.Enums;
import defsu.system.server.utils.Logger;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
import org.hibernate.Session;
import org.hibernate.query.Query;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.CompletableFuture;

public class ObjectCore {

    public static final String CRITERIA_SEARCH = "@search";
    public static final String CRITERIA_PAGE = "@page";
    public static final String CRITERIA_START = "@start";
    public static final String CRITERIA_LIMIT = "@limit";
    public static final String CRITERIA_ORDER = "@sort";
    public static final String CRITERIA_ORDER_ASC = "A";
    public static final String CRITERIA_ORDER_DESC = "D";
    public static final String DBNULL = "DBNULL";
    public static final String METHOD_NAME = "@method";
    private static final String LOG_UNIT = "ObjectCore";
    public static String LOG_EXCLUDECLASS = "*";
    public static boolean LOG = true;
    public static boolean SHOWSQL = false;
    public static boolean BLUR = true;
    public static int LOGCOUNT = 0;
    //public static HashMap<Integer, HashMap<String, FormPermission>> permissionsCache = new HashMap(); // TODO:: permissions
    private static StringDictionary<List<ObjectCore.ManipulationHandler>> handlers = new StringDictionary();

    public static String clearHtml(String html) {
        return html.replaceAll("<[^>]*>", "");
    }

    public static String blur(String s, int start) {
        if (!BLUR || s == null || s.length() <= start) {
            return s;
        }

        char[] c = s.toCharArray();
        for (int i = start; i < c.length; i++) {
            c[i] = '*';
        }
        return new String(c);
    }

    public static SuRecord getByPK(Class<? extends SuRecord> cls, byte[] pk) {
        try {
            SuRecord record = cls.getDeclaredConstructor().newInstance();
            load(record.getClass(), pk);
            return record;
        } catch (Exception e) {
            System.err.println("Error creating ArkRecord instance: " + e.getMessage());
            return null;
        }
    }

    public static SuRecord getByPK(Class<? extends SuRecord> cls, String pk) {
        byte[] pkBytes = RecordCore.h2B(pk);
        return getByPK(cls, pkBytes);
    }

    public static byte[] getPrimaryKeyValue(SuRecord r){
        SuRecord.RecordProperties props = r.getField();
        return (byte[]) getFieldValue(r, props.primaryKey);
    }









    public static Object parse(String value, SuField f) {
        return null;
    }


    public static Object load(Class<?> obj, byte[] pk){
        return HibernateCore.getMain(obj.getSuperclass(),pk);
    }

    public static Object copyPojoToRecord(Object o, SuRecord obj){
        Method[] sourceMethods = o.getClass().getMethods();
        Method[] targetMethods = obj.getClass().getMethods();
        for (Method sourceMethod : sourceMethods) {
            if (sourceMethod.getName().startsWith("get")) {
                for (Method targetMethod : targetMethods) {
                    if (targetMethod.getName().startsWith("set")) {
                        if (sourceMethod.getName().substring(3).equals(targetMethod.getName().substring(3))) {
                            try {
                                targetMethod.invoke(obj, sourceMethod.invoke(o));
                            } catch (Exception e) {
                                Logger.Error(e, true);
                            }
                        }
                    }
                }
            }
        }
        return obj;
    }

    public static String convertToString(Object value, SuField.FT type) {
        if (value == null) {
            return "";
        } else if (value instanceof byte[]) {
            return RecordCore.b2H((byte[]) value);
        } else if (value instanceof Date) {

            if (type == SuField.FT.ONLY_DATE) {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                return sdf.format((Date) value);
            }
            if (type == SuField.FT.ONLY_DATE_2) {
                SimpleDateFormat sdf = new SimpleDateFormat("dd.MM.yyyy");
                return sdf.format((Date) value);
            }


            if (((Date) value).getTime() == ServerUtility.emptyDate.getTime()) {
                return "-";
            } else {
                Date dValue = (Date) value;
                if (type == SuField.FT.DATETIME) {
                    return (new SimpleDateFormat(ServerUtility.DATETIME_FORMAT)).format(dValue);
                } else if (type == SuField.FT.DATE) {
                    return (new SimpleDateFormat(ServerUtility.DATE_FORMAT)).format(dValue);
                } else {
                    return dValue.getHours() == 0 && dValue.getMinutes() == 0 && dValue.getSeconds() == 0 ? (new SimpleDateFormat(ServerUtility.DATE_FORMAT)).format(dValue) : (new SimpleDateFormat(ServerUtility.DATETIME_FORMAT)).format(dValue);
                }
            }
        } else if (!(value instanceof Double) && !(value instanceof Float) && !(value instanceof BigDecimal)) {
            return value.toString();
        } else if (type == SuField.FT.CURRENCY) {
            return ServerUtility.getCurrencyFormat().format(value);
        } else if (type == SuField.FT.CURRENCY_2) {
            return ServerUtility.getCurrencyFormat2().format(value);
        } else if (type == SuField.FT.DOUBLE_2) {
            return ServerUtility.getDecimalFormat2().format(value);
        } else if (type == SuField.FT.DOUBLE_3) {
            return ServerUtility.getDecimalFormat3().format(value);
        } else {
            return type == SuField.FT.DOUBLE ? ServerUtility.getDecimalFormat().format(value) : ServerUtility.getDecimalFormat2().format(value);
        }
    }

    public static void addDate(SuRecord r) {
        setFieldValue(r, "createdDate", ServerUtility.now());
    }

    public static boolean save(SuRecord r) {
        return save(r, false);
    }

    public static boolean save(SuRecord r, boolean pumpMessage) {
        return save(r, pumpMessage, true);
    }
    public static boolean save(SuRecord r, boolean pumpMessage, boolean processInsertUpdate) {
        SessionCore sc = SessionCore.getCurrentContext();
        HibernateCore hh = sc.getHibernateHandler();
        SuRecord.RecordProperties props = r.getField();
        byte[] pkValue = (byte[]) getFieldValue(r, props.primaryKey);
        boolean isNew = (pkValue == null);

        if (isNew) {
            pkValue = RecordCore.guid();
            setFieldValue(r, props.primaryKey, pkValue);
            addDate(r);
        }

        r.process();
        Object pojo = getPojo(r);
        boolean result = isNew ? hh.saveMain(pojo) : hh.updateMain(pojo);

        if (result) {
            if (pumpMessage && (Boolean) getFieldValue(r, "visible")) {
                sendPumpMessage(r, pkValue, isNew);
            }

            if (processInsertUpdate) {
                processInsertOrUpdate(r, isNew);
            }
        }

        if (LOG) {
            logRecord(r, isNew, pkValue);
        }

        return result;
    }

    private static void sendPumpMessage(SuRecord r, byte[] pkValue, boolean isNew) {
        load(r.getClass(), pkValue);
        WSUpdateCore.Payload p = new WSUpdateCore.Payload();
        p.manipulations = new ArrayList<>();

        RecordManipulation manipulation = new RecordManipulation();
        manipulation.record = getRecord(r);
        manipulation.row = getRecordRow(r);
        manipulation.status = Enums.StatusType.SUCCESS;
        manipulation.targetClass = r.getClass().getName();
        manipulation.type = isNew ? Enums.ManipulationType.INSERT : Enums.ManipulationType.UPDATE;
        manipulation.owner = ServerUtility.getUser().getUserRealName();
        manipulation.targetPK = RecordCore.b2H(pkValue);

        p.manipulations.add(manipulation);
        WSUpdateCore.pump(r.getClass(), p);
        Combo.updateRegisters(r.getClass());
    }

    private static void processInsertOrUpdate(SuRecord r, boolean isNew) {
        if (isNew) {
            processInsert(r);
        } else {
            processUpdate(r);
        }
    }

    private static void logRecord(SuRecord r, boolean isNew, byte[] pkValue) {
        try {
            if (!r.disableLog()) {
                logHandler(ServerUtility.getUser(), r, isNew, pkValue);
            }
        } catch (Exception e) {
            System.err.println("Error logging record: " + e.getMessage());
        }
    }

    public static void addHandler(ObjectCore.ManipulationHandler handler) {
        handlers.computeIfAbsent(handler.targetClass.getName(), k -> new ArrayList<>()).add(handler);
    }

    private static void processManipulation(SuRecord r, Enums.ManipulationType type) {
        List<ObjectCore.ManipulationHandler> handlerList = handlers.get(r.getClass().getName());
        if (handlerList != null) {
            for (ObjectCore.ManipulationHandler handler : handlerList) {
                switch (type) {
                    case INSERT -> handler.onInsert(r);
                    case UPDATE -> handler.onUpdate(r);
                    case DELETE -> handler.onDelete(r);
                }
            }
        }
    }
    public static void logHandler(final User user, final SuRecord r, final Boolean isNew, final byte[] pkValue) {
        CompletableFuture.runAsync(() -> {
            try {
                Manipulationlog log = new Manipulationlog();
                byte[] logData = ObjectCore.serialize(r);

                boolean changedNothing = isNew
                        ? !(Boolean) ObjectCore.getFieldValue(r, "visible")
                        : Arrays.equals(Manipulationlog.getLastLog(pkValue), logData);

                if (!changedNothing) {
                    log.setManipulationLogTypeFK(isNew ? RecordCore.i2B(1) : RecordCore.i2B(2));

                    if (user.getUserPK() != null) {
                        log.setUserFK(user.getUserPK());
                    }

                    SessionCore sc = SessionCore.getCurrentContext();
                    sc.getHibernateHandler().beginTransaction();

                    log.setManipulationLogStatusFK(RecordCore.i2B(1));
                    log.setManipulationLogDT(ServerUtility.now());
                    log.setManipulationLogData(logData);
                    log.setManipulationLogClass(r.getClass().getName());
                    log.setManipulationLogTargetFK(pkValue);
                    log.setManipulationLogClassTitle(r.getField().title);

                    ObjectCore.save(log, false);
                    sc.getHibernateHandler().commitMain();
                    Logger.Info("LOGCOUNT:"+(++LOGCOUNT));
                }
            } catch (Exception e) {
                System.err.println("Error in logHandler: " + e.getMessage());
                e.printStackTrace();
            }
        });
    }



    public static Record getRecord(SuRecord r) {
        Record output = new Record();
        SuField.SuFieldList fields = r.getField().fields;

        for (int k = 0; k < fields.getCount(); k++) {
            try {
                SuField f = fields.get(k);
                RecordValue v = createRecordValue(r, f);
                output.getValues().add(v);

                // İlişkili alanları işlemek için yardımcı metot
                if (f.relation != null) {
                    processRelatedFields(r, f, output);
                }
            } catch (Exception e) {
                System.err.println("Error processing field: " + e.getMessage());
            }
        }

        return output;
    }

    private static RecordValue createRecordValue(SuRecord r, SuField f) {
        RecordValue v = new RecordValue(f);
        v.setValue(toString(getFieldValue(r, f.name)));
        return v;
    }

    private static void processRelatedFields(SuRecord r, SuField f, Record output) {
        for (String relName : f.relation.displayFields) {
            SuField field = findForeignField(r, relName, r.getClass());
            if (field != null) {
                RecordValue v2 = new RecordValue(field);
                String relVal = findRelatedValue(r, field, relName);
                v2.setValue(relVal);
                output.getValues().add(v2);
            }
        }
    }

    private static String findRelatedValue(SuRecord r, SuField field, String relName) {
        String relVal = "";
        List<SuField> path = (List<SuField>) field.path.get(r.getClass().getName());
        Object related = r;

        // İlgili alana ulaşmak için path'i takip et
        for (int j = path.size() - 1; j >= 0; j--) {
            SuField cField = path.get(j);
            related = getFieldValue(related, cField.name.replace("FK", ""));
            if (related == null) {
                return "";
            }
        }

        // İlgili değeri al
        if (related != null) {
            relVal = toString(getFieldValue(related, relName));
            if (field.displayAs == SuField.DT.COMBOBOX) {
                relVal = getComboBoxDisplayedValue(related, field, relName, relVal);
            }
        }

        return relVal;
    }

    private static String getComboBoxDisplayedValue(Object related, SuField field, String relName, String relVal) {
        try {
            SuRecord dRelated = (SuRecord) field.relation.targetClass.getDeclaredConstructor().newInstance();
            return getFieldDisplayedValue((SuRecord) copyPojoToRecord(related, dRelated), relName, relVal);
        } catch (Exception e) {
            System.err.println("Can not create new instance of " + field.relation.targetClass.getName());
            return relVal;
        }
    }



    public static RecordRow getRecordRow(SuRecord r) {
        return getRecordRow(r, new ObjectCore.ListResultParams());
    }

    public static RecordRow getRecordRow(SuRecord r, ObjectCore.ListResultParams params) {
        RecordRow row = new RecordRow();
        String langCode = SystemApplication.DEFAULT_LANGUAGE;

        SuField.SuFieldList fields = r.getField().fields;
        for (int k = 0; k < fields.getCount(); ++k) {
            try {
                SuField f = fields.get(k);
                if (params.isColumnAllowed(f.name)) {
                    RecordRow.RecordColumnData cData = createColumnData(r, f, langCode);
                    row.getColumns().add(cData);

                    if (f.relation != null) {
                        row.getColumns().addAll(getRelationData(r, f));
                    }
                }
            } catch (Exception e) {
                Logger.Error(e,"ObjectCore.GetRecordRow:Error getting record row.", true);
                e.printStackTrace(System.out);
            }
        }

        addMetadataColumns(r, row);
        return row;
    }

    private static RecordRow.RecordColumnData createColumnData(SuRecord r, SuField f, String langCode) {
        RecordRow.RecordColumnData cData = new RecordRow.RecordColumnData();
        String val = getLanguageSpecificValue(r, f, langCode);

        cData.setName(f.name);
        /*if (f.translateable && val.startsWith("??") && val.endsWith("??")) {
            String relName = val.substring(2, val.length() - 2);
            cData.translateable = new Translateable(relName);
            val = Definitions.getLiteral(relName);
        }*/

        if (f.displayAs == SuField.DT.COMBOBOX || f.visualize != null) {
            cData.setActualValue(val);
            val = getFieldDisplayedValue(r, f.name, val);
        }

        if (f.fieldType == SuField.FT.INTEGER && f.visualize == null) {
            cData.isInteger = true;
        } else if (f.fieldType == SuField.FT.DOUBLE || f.fieldType == SuField.FT.CURRENCY) {
            cData.isDouble = true;
        }

        cData.setValue(val);
        return cData;
    }

    private static String getLanguageSpecificValue(SuRecord r, SuField f, String langCode) {
        if (f.getLanguageColumns() != null) {
            StringDictionary<SuField.LanguageColumn> languageColumns = f.getLanguageColumns();
            if (languageColumns.containsKey(langCode)) {
                return convertToString(getFieldValue(r, languageColumns.get(langCode).columnName), f.fieldType);
            }
        }
        return convertToString(getFieldValue(r, f.name), f.fieldType);
    }

    private static List<RecordRow.RecordColumnData> getRelationData(SuRecord r, SuField f) {
        List<RecordRow.RecordColumnData> relatedColumns = new ArrayList<>();
        for (String relName : f.relation.displayFields) {
            RecordRow.RecordColumnData relData = new RecordRow.RecordColumnData();
            String relVal = getRelatedFieldValue(r, relName, f);
            relData.setName(relName);
            relData.setValue(relVal);
            relatedColumns.add(relData);
        }
        return relatedColumns;
    }

    private static String getRelatedFieldValue(SuRecord r, String relName, SuField f) {
        SuField field = findForeignField(r, relName, r.getClass());
        if (field == null) return "";

        Object related = r;
        for (SuField cField : field.path.getOrDefault(r.getClass().getName(), Collections.emptyList())) {
            related = getFieldValue(related, cField.name.replace("FK", ""));
            if (related == null) return "";
        }

        String relVal = toString(getFieldValue(related, relName));
        if (field.displayAs == SuField.DT.COMBOBOX) {
            try {
                SuRecord dRelated = (SuRecord) field.relation.targetClass.getDeclaredConstructor().newInstance();
                relVal = getFieldDisplayedValue((SuRecord)copyPojoToRecord(related, dRelated), relName, relVal);
            } catch (Exception e) {
                System.out.println("Cannot create new instance of " + field.relation.targetClass.getName());
            }
        }
        return relVal;
    }

    private static void addMetadataColumns(SuRecord r, RecordRow row) {
        RecordRow.RecordColumnData idData = new RecordRow.RecordColumnData();
        idData.setName("@id");
        idData.setValue(r.getField().primaryKey);
        row.getColumns().add(idData);

        RecordRow.RecordColumnData styleData = new RecordRow.RecordColumnData();
        styleData.setName("@style");
        styleData.setValue(r.getField().style);
        row.getColumns().add(styleData);
    }


    private static void processInsert(SuRecord r) {
        processManipulation(r, Enums.ManipulationType.INSERT);
    }

    private static void processUpdate(SuRecord r) {
        processManipulation(r, Enums.ManipulationType.UPDATE);
    }

    private static void processDelete(SuRecord r) {
        processManipulation(r, Enums.ManipulationType.DELETE);
    }




    public static String getFieldDisplayedValue(SuRecord r, String fieldName) {
        return getFieldDisplayedValue(r, fieldName, toString(getFieldValue(r, fieldName)), true);
    }

    public static String getFieldDisplayedValue(SuRecord r, String fieldName, String value) {
        return getFieldDisplayedValue(r, fieldName, value, true);
    }

    public static String getFieldDisplayedValue(SuRecord r, String fieldName, byte[] value) {
        return getFieldDisplayedValue(r, fieldName, toString(value), true);
    }

    public static String getFieldDisplayedValue(SuRecord r, String fieldName, String value, boolean translate) {
        SuField f = r.getField().fields.get(fieldName);
        if (f == null) return "";

        if (f.visualize != null) {
            return f.visualize.morph(r);
        }

        if (f.comboAdapter == null) {
            return value;
        }


        if (value.equals(RecordCore.b2H(new byte[16]))) {
            return "";
        }

        // Retrieve from combo adapter
        String translatedValue = getComboAdapterValue(f.comboAdapter, value, translate);
        if (translatedValue != null) {
            return translatedValue;
        }

        // If combo adapter is dynamic, attempt to refresh and retrieve again
        if (f.comboAdapter instanceof DynamicComboAdapter) {
            DynamicComboAdapter dca = (DynamicComboAdapter) f.comboAdapter;
            return getDynamicComboAdapterValue(dca, f, value, translate, fieldName);
        }

        return "";
    }

    private static String getComboAdapterValue(ComboAdapter comboAdapter, String value, boolean translate) {
        HashMap<String, ForeignKeyPair> pairs = comboAdapter.getPairsHash();
        ForeignKeyPair pair = pairs.get(value);
        return pair != null ? translateIfNeeded(pair.value, translate) : null;
    }

    private static String getDynamicComboAdapterValue(DynamicComboAdapter dca, SuField f, String value, boolean translate, String fieldName) {
        dca.resetPairs();
        String translatedValue = getComboAdapterValue(dca, value, translate);
        if (translatedValue != null) {
            return translatedValue;
        }

        try {
            Class<?> cls = dca.getTargetClass();
            return getFieldValue(f.displayField, (Class<SuRecord>)cls, RecordCore.h2B(value), fieldName);
        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }

    public static <V extends SuRecord> String getFieldValue(String field, Class<V> cls, byte[] whereParam, String whereField) {
        try {
            CriteriaBuilder builder = HibernateCore.getMainSessionFactory().getCriteriaBuilder();
            CriteriaQuery<V> criteriaQuery = builder.createQuery(cls);
            Root<V> root = criteriaQuery.from(cls);

            criteriaQuery.select(root).where(builder.equal(root.get(whereField), whereParam));
            criteriaQuery.distinct(true);

            ListResult result = ObjectCore.list(cls, criteriaQuery, null);

            if (!result.records.isEmpty()) {
                return (String) ObjectCore.getFieldValue(result.records.get(0), field);
            }
        } catch (Exception e) {
            Logger.Error(e, true);
            return "-";
        }

        return "-";
    }

    private static String translateIfNeeded(String value, boolean translate) {
        return value;
    }

    public static SuField findForeignField(SuRecord r, String fieldName, Class<? extends SuRecord> forClass) {
        SuField.SuFieldList fields = r.getField().fields;

        for (int k = 0; k < fields.getCount(); k++) {
            SuField field = fields.get(k);
            if (field.relation != null) {
                SuRecord instance = createInstance((Class<? extends SuRecord>) field.relation.targetClass);
                if (instance == null) {
                    System.out.println("Error initiating foreign field class: " + r.getClass().getName() + "." + field.name);
                    return null;
                }

                SuField targetField = findInDisplayFields(instance, field, fieldName, forClass);
                if (targetField != null) {
                    return targetField;
                }

                SuField f2 = findForeignField(instance, fieldName, forClass);
                if (f2 != null) {
                    f2.path.get(forClass.getName()).add(field);
                    return f2;
                }
            }
        }

        return null;
    }
    
    
    public static SuResponse invoke(Class<?> cls, StringDictionary<String> mem) {
        SuResponse response = new SuResponse();

        SuRecord record = createRecordInstance(cls, response);
        if (record == null) {
            return response;
        }

        String methodName = mem.get("@method");
        if (methodName == null) {
            response.setStatusCode("702");
            return response;
        }

        Method method = _findMethod(cls.getMethods(), methodName).orElse(null);
        if (method == null) {
            return createErrorResponse("705", "ObjectCore", "invokeerror",
                    "Can not find method: " + cls.getName() + "." + methodName,
                    "HATA",
                    "İnternet bağlantınız stabil değil, lütfen sayfayı yenileyiniz...");
        }

        if (!isUserAuthorized(method)) {
            return createUnauthorizedResponse();
        }

        RecordMethod recordMethod = record.getField().methods.get(methodName);
        if (recordMethod == null) {
            response.setStatusCode("705");
            return response;
        }

        Object[] args = getArguments(mem, recordMethod);
        if (args == null) {
            return createErrorResponse("707", "ObjectCore", "ArgumentError",
                    "Required arguments missing.",
                    "HATA",
                    "Gerekli argümanlardan bazıları eksik.");
        }

        try {
            Object result = method.invoke(record, args);
            return handleResult(result, response);
        } catch (Exception e) {
            Logger.Error(e,"ObjectCore.LoginErrMaybe-->"+methodName,true);
            response.setStatusCode("709");
            return response;
        }
    }

    private static Optional<Method> _findMethod(Method[] methods, String name) {
        return Arrays.stream(methods)
                .filter(method -> method.getName().equals(name))
                .findFirst();
    }


    private static SuRecord createRecordInstance(Class<?> cls, SuResponse response) {
        try {
            Object o = cls.getDeclaredConstructor().newInstance();
            if (!(o instanceof SuRecord)) {
                response.setStatusCode("706");
                return null;
            }
            return (SuRecord) o;
        } catch (Exception e) {
            response.setStatusCode("706");
            return null;
        }
    }

    private static boolean isUserAuthorized(Method method) {
        Permission permission = method.getAnnotation(Permission.class);
        int requiredLevel = (permission != null) ? permission.minimumUserLevel() : 2;
        return ServerUtility.getUser().getUserLevel() >= requiredLevel;
    }

    private static SuResponse createUnauthorizedResponse() {
        SuResponse response = new SuResponse();
        InteractionMessage message = new InteractionMessage();
        message.setTitle("YETKİ HATASI");
        message.setMessage("Bu işlemi yapmaya yetkiniz yok.");
        response.getMessages().add(message);
        return response;
    }

    private static SuResponse createErrorResponse(String statusCode, String loggerComponent, String loggerMethod,
                                                   String logMessage, String titleKey, String message) {
        SuResponse response = new SuResponse();
        response.setStatusCode(statusCode);
        Logger.Error(loggerComponent+ ":"+loggerMethod+"-->"+logMessage, true);
        InteractionMessage interactionMessage = new InteractionMessage();
        interactionMessage.setTitle(titleKey);
        interactionMessage.setMessage(message);
        response.getMessages().add(interactionMessage);
        return response;
    }

    private static Object[] getArguments(StringDictionary<String> mem, RecordMethod recordMethod) {
        Object[] args = new Object[recordMethod.argumentList.getCount()];

        for (int i = 0; i < recordMethod.argumentList.getCount(); i++) {
            RecordArgument arg = recordMethod.argumentList.get(i);
            if (mem.containsKey(arg.name)) {
                SuField field = new SuField();
                field.fieldType = SuField.FT.valueOf(arg.argumentType.name());
                args[i] = parse(mem.get(arg.name), field);
            } else {
                args[i] = getArgumentFromForm(recordMethod, arg);
                if (args[i] == null) {
                    return null;  // Eğer bir argüman eksikse, null döner
                }
            }
        }
        return args;
    }

    private static Object getArgumentFromForm(RecordMethod recordMethod, RecordArgument arg) {
        if (recordMethod.WindowForm == null) {
            return null;
        }

        WindowForm form = ServerUtility.getForm(recordMethod.WindowForm);
        if (form == null) {
            return null;
        }

        Component cmp = form.findArgument(arg.name);
        return (cmp != null) ? cmp.getInputValue() : null;
    }

    private static SuResponse handleResult(Object result, SuResponse response) {
        if (result instanceof SuResponse) {
            return (SuResponse) result;
        } else {
            response.setStatusCode("708");
            return response;
        }
    }



    public static SuRecord createInstance(Class<? extends SuRecord> targetClass) {
        try {
            return targetClass.getDeclaredConstructor().newInstance();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private static SuField findInDisplayFields(SuRecord instance, SuField field, String fieldName, Class<?> forClass) {
        if (field.relation.displayFields == null) {
            return null;
        }

        for (String s : field.relation.displayFields) {
            if (s.equals(fieldName)) {
                SuField targetField = instance.getField().fields.get(fieldName);
                if (targetField != null) {
                    targetField.path.put(forClass.getName(), new ArrayList<>());
                    targetField.path.get(forClass.getName()).add(field);
                    return targetField;
                }
            }
        }

        return null;
    }





    public static Object getPojo(SuRecord r){
        Class pojoCls;
        Object pojo;
        try{
            for (pojoCls = r.getClass().getSuperclass(); !pojoCls.getSimpleName().startsWith("Map"); pojoCls = pojoCls.getSuperclass()) {
            }
            byte[] primaryKey = getPrimaryKeyValue(r);
            if(primaryKey != null){
                pojo = HibernateCore.getMain(pojoCls, primaryKey);
            }else{
                pojo = null;
            }

            if(pojo == null){
                pojo = pojoCls.newInstance();
            }

            Method[] targetMethods = pojo.getClass().getMethods();
            Method[] sourceMethods = r.getClass().getMethods();

            for (Method targetMethod : targetMethods) {
                if (targetMethod.getName().startsWith("set")) {
                    for (Method sourceMethod : sourceMethods) {
                        if (sourceMethod.getName().startsWith("get")) {
                            if (sourceMethod.getName().substring(3).equals(targetMethod.getName().substring(3))) {
                                targetMethod.invoke(pojo, sourceMethod.invoke(r));
                            }
                        }
                    }
                }
            }
            return pojo;
        }catch (Exception e){
            Logger.Error(e, true);
            return null;
        }
    }


    private static String generateAccessorName(String prefix, String fieldName) {
        return prefix + fieldName.substring(0, 1).replace("i","I").toUpperCase(Locale.getDefault()) + fieldName.substring(1);
    }

    public static Object getFieldValue(Object r, String fieldName) {
        String accessorName = generateAccessorName("get", fieldName);

        try {
            Method getAccessor = r.getClass().getMethod(accessorName);
            Object value = getAccessor.invoke(r);
            return value;
        } catch (Exception e) {
            Logger.Error(e,"Error setting field:"+r.getClass().getName()+":"+fieldName, true);
            return null;
        }
    }

    public static void setFieldValue(SuRecord r, String fieldName, Object value) {
        String langCode = SystemApplication.DEFAULT_LANGUAGE;
        String accessorName = generateAccessorName("set", fieldName);

        SuField field = r.getField().fields.get(fieldName);
        if (field != null && field.getLanguageColumns() != null) {
            StringDictionary<SuField.LanguageColumn> languageColumns = field.getLanguageColumns();
            if (languageColumns.containsKey(langCode)) {
                String languageColumn = languageColumns.get(langCode).columnName;
                accessorName = generateAccessorName("set", languageColumn);
            }
        }

        try {
            Class<?> vCls = determineValueClass(value);
            Method setAccessor = r.getClass().getMethod(accessorName, vCls);
            setAccessor.invoke(r, value);
        } catch (Exception e) {
            Logger.Error(e,"Error setting field:"+r.getClass().getName()+":"+fieldName, true);
        }
    }

    private static Class<?> determineValueClass(Object value) {
        if (value == null) {
            return byte[].class;
        }
        Class<?> vCls = value.getClass();
        if (vCls.equals(Boolean.class)) {
            return Boolean.TYPE;
        } else if (vCls.equals(Integer.class)) {
            return Integer.TYPE;
        } else if (vCls.equals(Float.class)) {
            return Float.TYPE;
        } else if (vCls.equals(Double.class)) {
            return Double.TYPE;
        }
        return vCls;
    }

    public static void setFieldsToDefaults(SuRecord r) {
        SuRecord.RecordProperties props = r.getField();

        for (int k = 0; k < props.fields.getCount(); ++k) {
            try {
                SuField field = props.fields.get(k);
                setFieldValue(r, field.name, field.defaultValue);
            } catch (Exception e) {
                Logger.Error(e,"ObjectCore.setFieldsToDefaults:"+props.fields.toString(), true);
            }
        }
    }

    public static byte[] serialize(SuRecord r) {
        try {
            ByteArrayOutputStream bs = new ByteArrayOutputStream();
            ObjectOutputStream stream = new ObjectOutputStream(bs);
            stream.writeObject(r);
            return bs.toByteArray();
        } catch (Exception e) {
            Logger.Error(e, true);
            return null;
        }
    }

    public static SuRecord deserialize(byte[] binaryData) {
        try {
            ByteArrayInputStream input = new ByteArrayInputStream(binaryData);
            ObjectInputStream stream = new ObjectInputStream(input);
            return (SuRecord) stream.readObject();
        } catch (Exception e) {
            Logger.Error(e, true);
            return null;
        }
    }

    public static String toString(Object value) {
        return convertToString(value, (SuField.FT) null);
    }

    public static <T> ListResult list(Class<T> cls, CriteriaQuery<T> criteria, ListParameter params) {
        ListResult output = new ListResult();

        try (Session session = HibernateCore.getMainSessionFactory().openSession()) {
            CriteriaBuilder builder = session.getCriteriaBuilder();
            output.numTotal = 0;
            Query<T> query = session.createQuery(criteria);
            if (params != null) {
                query.setFirstResult(params.start);
                query.setMaxResults(params.limit);
            }
            output.records = (List<SuRecord>) query.getResultList();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return output;
    }

    public static <T> ListResult list(Class<? extends SuRecord> cls, CriteriaQuery<T> criteria) {
        ListResult output = new ListResult();

        try (Session session = HibernateCore.getMainSessionFactory().openSession()) {
            CriteriaBuilder builder = session.getCriteriaBuilder();
            output.numTotal = 0;
            Query<T> query = session.createQuery(criteria);
            // output.records = (List<Object>) query.getResultList();
            List<Object> records = (List<Object>) query.getResultList();
            for (Object record : records) {
                output.records.add((SuRecord) copyPojoToRecord(record, cls.newInstance()));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return output;
    }




    public static class ListParameter {
        public int start;
        public int limit;
        public int page;
        public CriteriaBuilder initialCriteria;
        public boolean storeParams = true;
    }

    public static class ListResult {
        public List<SuRecord> records = new ArrayList();
        public List<RecordRow> rows = new ArrayList();
        public int numTotal = 0;
        public String dateFormat;

        public ListResult() {
            this.dateFormat = ServerUtility.DATETIME_FORMAT;
        }
    }
    public static class ListResultParams {
        public String[] fetchOnly;
        public CriteriaBuilder initialCriteria;

        public boolean isColumnAllowed(String column) {
            if (this.fetchOnly == null) {
                return true;
            } else {
                for (int k = 0; k < this.fetchOnly.length; ++k) {
                    if (this.fetchOnly[k].equals(column)) {
                        return true;
                    }
                }

                return false;
            }
        }
    }
    public abstract static class ManipulationHandler {
        public Class<? extends SuRecord> targetClass;

        public abstract void onUpdate(SuRecord r);

        public abstract void onInsert(SuRecord r);

        public abstract void onDelete(SuRecord r);
    }
}
