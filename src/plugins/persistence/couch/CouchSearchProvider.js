/*****************************************************************************
 * Open MCT, Copyright (c) 2014-2022, United States Government
 * as represented by the Administrator of the National Aeronautics and Space
 * Administration. All rights reserved.
 *
 * Open MCT is licensed under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * Open MCT includes source code licensed under additional open source
 * licenses. See the Open Source Licenses file (LICENSES.md) included with
 * this source code distribution or the Licensing information page available
 * at runtime from the About dialog for additional information.
 *****************************************************************************/

// This provider exists because due to legacy reasons, we need to install
// two plugins for two namespaces for CouchDB: one for "mct", and one for "".
// Because of this, we need to separate out the search provider from the object
// provider so we don't return two results for each found object.
// If the above namespace is ever resolved, we can fold this search provider
// back into the object provider.

class CouchSearchProvider {
    constructor(couchObjectProvider) {
        this.couchObjectProvider = couchObjectProvider;
    }

    search(query, abortSignal) {
        const filter = {
            "selector": {
                "model": {
                    "name": {
                        "$regex": `(?i)${query}`
                    }
                }
            }
        };

        return this.couchObjectProvider.getObjectsByFilter(filter, abortSignal);
    }

    searchForAnnotationsForDomainObject(keyString, abortSignal) {
        const filter = {
            "selector": {
                "$and": [
                    {
                        "model": {
                            "targets": {
                            }
                        }
                    },
                    {
                        "model.type": {
                            "$eq": "annotation"
                        }
                    }
                ]
            }
        };
        filter.selector.model.targets[keyString] = {
            "$exists": true
        };

        return this.couchObjectProvider.getObjectsByFilter(filter, abortSignal);
    }

    searchForAnnotationsTargetByIDAndTimestampRange(keyString, startInclusive, endInclusive, abortSignal) {
        const filter = {
            "selector": {
                "$and": [
                    {
                        "model": {
                            "targets": {
                            }
                        }
                    },
                    {
                        "model.type": {
                            "$eq": "annotation"
                        }
                    }
                ]
            }
        };
        filter.selector.model.targets[keyString] = {
            "targetTime": {
                "start": {
                    "$gte": startInclusive
                },
                "end": {
                    "$lte": endInclusive
                }
            }
        };

        return this.couchObjectProvider.getObjectsByFilter(filter, abortSignal);
    }

    searchForAnnotationsByTextQuery(query, abortSignal) {
        const filter = {
            "selector": {
                "$and": [
                    {
                        "$and": [
                            {
                                "model.contentText": {
                                    "$regex": `(?i)${query}`
                                }
                            },
                            {
                                "model.tags": {
                                    "$elemMatch": {
                                        "": {
                                            "$regex": `(?i)${query}`
                                        }
                                    }
                                }
                            }
                        ]
                    },
                    {
                        "model.type": {
                            "$eq": "annotation"
                        }
                    }
                ]
            }
        };

        return this.couchObjectProvider.getObjectsByFilter(filter, abortSignal);
    }

    searchForAnnotationsByPath(path, abortSignal) {
        const filter = {
            "selector": {
                "$and": [
                    {
                        "model": {
                            "originalContextPath": {
                                "${eq}": path
                            }
                        }
                    },
                    {
                        "model.type": {
                            "$eq": "annotation"
                        }
                    }
                ]
            }
        };

        return this.couchObjectProvider.getObjectsByFilter(filter, abortSignal);
    }
}
export default CouchSearchProvider;
