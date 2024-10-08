package ru.nshevtsova.estates.utils;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;

public class JsonCommaDeserializer extends JsonDeserializer<Double> {

    @Override
    public Double deserialize(JsonParser jsonParser, DeserializationContext deserializationContext) throws IOException {
         String value = jsonParser.getText();
        if (value.contains(",")) {
            value = value.replace(",", ".");
        }
        return Double.valueOf(value);
    }
}
