package com.campus.eventmanagement.config;

import com.campus.eventmanagement.service.SequenceGeneratorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.mapping.event.BeforeConvertCallback;
import org.springframework.stereotype.Component;

import java.lang.reflect.Field;

@Component
public class MongoIdGeneratorCallback implements BeforeConvertCallback<Object> {

    @Autowired
    @org.springframework.context.annotation.Lazy
    private SequenceGeneratorService sequenceGenerator;

    @Override
    public Object onBeforeConvert(Object entity, String collection) {
        try {
            Field idField = null;
            Class<?> clazz = entity.getClass();
            while (clazz != null) {
                try {
                    idField = clazz.getDeclaredField("id");
                    break;
                } catch (NoSuchFieldException e) {
                    clazz = clazz.getSuperclass();
                }
            }

            if (idField != null) {
                idField.setAccessible(true);
                Object idValue = idField.get(entity);
                if (idValue == null || (idValue instanceof Long && (Long) idValue == 0L)) {
                    long nextId = sequenceGenerator.generateSequence(collection + "_sequence");
                    idField.set(entity, nextId);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return entity;
    }
}
