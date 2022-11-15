private SearchRequest filterByAggregation(ListAggregatedCertificatesDtoIn dtoIn) {
    if (dtoIn.getIndex() == null) {
    dtoIn.setIndex(necsIndices);
    }
    SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();
    sourceBuilder.query(QueryBuilders.matchAllQuery());
    TermsAggregationBuilder termsAggregationBuilder = AggregationBuilders.terms("accountNumber").field("accountNumber");
    if (dtoIn.getSortCriteria() != null && dtoIn.getSortCriteria().getAccountNumber() != null) {
    BucketOrder order = aggregationKeyOrder(dtoIn.getSortCriteria().getAccountNumber());
    termsAggregationBuilder.order(order);
    }
    TermsAggregationBuilder subAggregationTeamBuilder = AggregationBuilders.terms("productionDeviceName").field("productionDeviceName");
    if (dtoIn.getSortCriteria() != null && dtoIn.getSortCriteria().getProductionDeviceName() != null) {
    BucketOrder order = aggregationKeyOrder(dtoIn.getSortCriteria().getProductionDeviceName());
    subAggregationTeamBuilder.order(order);
    }
    if (dtoIn.getGroupBy().size() == 2 &&
    ACCOUNT_NUMBER.equals(dtoIn.getGroupBy().get(0)) &&
    PRODUCTION_DEVICE_NAME.equals(dtoIn.getGroupBy().get(1))) {
    sourceBuilder.aggregation(termsAggregationBuilder);
    termsAggregationBuilder.subAggregation(subAggregationTeamBuilder);
    subAggregationTeamBuilder.subAggregation(AggregationBuilders.sum("sumOfQuantity").field("quantity"));
    }

    if (dtoIn.getGroupBy().size() == 3 &&
    ACCOUNT_NUMBER.equals(dtoIn.getGroupBy().get(0)) &&
    PRODUCTION_DEVICE_NAME.equals(dtoIn.getGroupBy().get(1)) &&
    PRODUCTION_DEVICE_COMMISIONING_DATE.equals(dtoIn.getGroupBy().get(2))) {
    TermsAggregationBuilder commissionDateSubAggregationTeamBuilder = AggregationBuilders.terms("productionDeviceCommissionDate").field("productionDeviceCommissionDate");
    if (dtoIn.getSortCriteria() != null && dtoIn.getSortCriteria().getProductionDeviceCommissionDate() != null) {
    BucketOrder order = aggregationKeyOrder(dtoIn.getSortCriteria().getProductionDeviceCommissionDate());
    commissionDateSubAggregationTeamBuilder.order(order);
    }
    sourceBuilder.aggregation(termsAggregationBuilder);
    termsAggregationBuilder.subAggregation(subAggregationTeamBuilder);
    subAggregationTeamBuilder.subAggregation(commissionDateSubAggregationTeamBuilder);
    commissionDateSubAggregationTeamBuilder.subAggregation(AggregationBuilders.sum("sumOfQuantity").field("quantity"));

    // .subAggregation(AggregationBuilders.sum("sumOfCertificates").field("countOfCertificates")));
    }
    if (dtoIn.getGroupBy().size() == 5 &&
    ACCOUNT_NUMBER.equals(dtoIn.getGroupBy().get(0)) &&
    PRODUCTION_DEVICE_NAME.equals(dtoIn.getGroupBy().get(1)) &&
    TECHNOLOGY_CODE.equals(dtoIn.getGroupBy().get(2)) &&
    FUEL.equals(dtoIn.getGroupBy().get(3)) &&
    ISSUING_BODY.equals(dtoIn.getGroupBy().get(4))) {

    TermsAggregationBuilder technologyCodeSubAggregationTeamBuilder = AggregationBuilders.terms("technologyCode").field("technologyCode");
    if (dtoIn.getSortCriteria() != null && dtoIn.getSortCriteria().getTechnologyCode() != null) {
    BucketOrder order = aggregationKeyOrder(dtoIn.getSortCriteria().getTechnologyCode());
    technologyCodeSubAggregationTeamBuilder.order(order);
    }
    TermsAggregationBuilder fuelSubAggregationTeamBuilder = AggregationBuilders.terms("fuel").field("fuel");
    if (dtoIn.getSortCriteria() != null && dtoIn.getSortCriteria().getFuel() != null) {
    BucketOrder order = aggregationKeyOrder(dtoIn.getSortCriteria().getFuel());
    fuelSubAggregationTeamBuilder.order(order);
    }
    TermsAggregationBuilder issuingBodyAggregationTeamBuilder = AggregationBuilders.terms("issuingBody").field("issuingBody");
    if (dtoIn.getSortCriteria() != null && dtoIn.getSortCriteria().getIssuingBody() != null) {
    BucketOrder order = aggregationKeyOrder(dtoIn.getSortCriteria().getIssuingBody());
    issuingBodyAggregationTeamBuilder.order(order);
    }
    // .subAggregation(AggregationBuilders.sum("sumOfCertificates").field("countOfCertificates")));

    sourceBuilder.aggregation(termsAggregationBuilder);
    termsAggregationBuilder.subAggregation(subAggregationTeamBuilder);
    subAggregationTeamBuilder.subAggregation(technologyCodeSubAggregationTeamBuilder);
    technologyCodeSubAggregationTeamBuilder.subAggregation(fuelSubAggregationTeamBuilder);
    fuelSubAggregationTeamBuilder.subAggregation(issuingBodyAggregationTeamBuilder);
    issuingBodyAggregationTeamBuilder.subAggregation(AggregationBuilders.sum("sumOfQuantity").field("quantity"));

    }
    sourceBuilder.from(dtoIn.getPageInfo().getPageIndex() * dtoIn.getPageInfo().getPageSize());
    sourceBuilder.size(dtoIn.getPageInfo().getPageSize());

    SearchRequest searchRequest = new SearchRequest(dtoIn.getIndex());
    searchRequest.source(sourceBuilder);

    return searchRequest;
    }
    }