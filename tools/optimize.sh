#!/usr/bin/env bash

java -jar ./node_modules/google-closure-compiler/compiler.jar \
    --js $1 \
    --js_output_file $2 \
    --compilation_level ADVANCED \
    --language_in ECMASCRIPT6_STRICT \
    --language_out ECMASCRIPT5_STRICT \
    --rewrite_polyfills false \
    --new_type_inf true \
    --formatting PRETTY_PRINT \
    /