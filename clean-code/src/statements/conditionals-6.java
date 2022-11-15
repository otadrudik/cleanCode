// noinspection JSUnusedGlobalSymbols

/**
   * Search data in search dataStore according to specific input parameters.
   *
   * @param searchRequest list aggregated certificates list request
   */
  @Override
  public ListAggregatedCertificatesDtoOut listByAggregatedCriteria(SearchRequest searchRequest) throws IOException {
    PageInfo pageInfo = new PageInfo();
    Double sumOfQuantity = null;

    //TODO implemenation is only PcC is needed to refactoring it.
    ListAggregatedCertificatesDtoOut listAggregatedCertificatesDtoOut = new ListAggregatedCertificatesDtoOut();
    SearchResponse searchResponse = restHighLevelClient.search(searchRequest, RequestOptions.DEFAULT);
    List<AggregatedCertificateDtoOut> certificateDtoOutList = new ArrayList<>();

    if (searchResponse.getHits() != null) {
      if (searchResponse.getAggregations() != null) {
        for (Aggregation aggregation : searchResponse.getAggregations()) {
          LOGGER.debug("Aggregation value: " + aggregation);
          for (Terms.Bucket bucket : ((ParsedLongTerms) aggregation).getBuckets()) {
            LOGGER.debug("Buckets value: " + bucket.getKeyAsNumber());
            for (Aggregation subAggregation : bucket.getAggregations()) {
              LOGGER.debug("SubAggregation value: " + subAggregation);
              for (Terms.Bucket subBucket : ((ParsedStringTerms) subAggregation).getBuckets()) {
                if (subBucket.getAggregations() != null && subBucket.getAggregations().get("sumOfQuantity") == null) {
                  for (Aggregation innerAggregation : subBucket.getAggregations()) {
                    if (innerAggregation.getName().equals("technologyCode")) {
                      for (Terms.Bucket inner2Bucket : ((ParsedStringTerms) innerAggregation).getBuckets()) {
                        LOGGER.debug("inner2Bucket value: " + inner2Bucket.getKeyAsString());
                        for (Aggregation inner3Aggregation : inner2Bucket.getAggregations()) {
                          LOGGER.debug("inner3Aggregation value: " + inner3Aggregation.getName());
                          for (Terms.Bucket inner3Bucket : ((ParsedStringTerms) inner3Aggregation).getBuckets()) {
                            LOGGER.debug("inner3Bucket value: " + inner3Bucket.getKeyAsString());
                            for (Aggregation inner4Aggregation : inner3Bucket.getAggregations()) {
                              AggregatedCertificateDtoOut aggregatedCertificateDtoOut2 = new AggregatedCertificateDtoOut();
                              aggregatedCertificateDtoOut2.setAccountNumber(bucket.getKeyAsNumber().longValue());
                              aggregatedCertificateDtoOut2.setProductionDeviceName(subBucket.getKeyAsString());
                              aggregatedCertificateDtoOut2.setTechnology(inner2Bucket.getKeyAsString());
                              aggregatedCertificateDtoOut2.setFuel(inner3Bucket.getKeyAsString());
                              for (Terms.Bucket inner4Bucket : ((ParsedStringTerms) inner4Aggregation).getBuckets()) {
                                aggregatedCertificateDtoOut2.setIssuingBody(inner4Bucket.getKeyAsString());
                                LOGGER.debug("inner4Bucket value: " + inner4Bucket.getKeyAsString());
                                sumOfQuantity = ((ParsedSum) inner4Bucket.getAggregations().get("sumOfQuantity")).getValue();
                                LOGGER.debug("Sum of quantity value: " + sumOfQuantity);
                                aggregatedCertificateDtoOut2.setSumOfQuantity(sumOfQuantity);
                                certificateDtoOutList.add(aggregatedCertificateDtoOut2);
                              }
                            }
                          }
                        }
                      }
                    } else {
                      for (Terms.Bucket inner2Bucket : ((ParsedLongTerms) innerAggregation).getBuckets()) {
                        AggregatedCertificateDtoOut aggregatedCertificateDtoOut2 = new AggregatedCertificateDtoOut();
                        if (aggregation.getName().equals("accountNumber")) {
                          LOGGER.debug("accountNumber value: " + bucket.getKeyAsNumber().longValue());
                          aggregatedCertificateDtoOut2.setAccountNumber(bucket.getKeyAsNumber().longValue());
                        }
                        if (subAggregation.getName().equals("productionDeviceName")) {
                          aggregatedCertificateDtoOut2.setProductionDeviceName(subBucket.getKeyAsString());
                        }
                        LOGGER.debug("inner2Bucket value: " + inner2Bucket.getKeyAsNumber());
                        aggregatedCertificateDtoOut2.setCommisioningDate(Instant.ofEpochMilli(inner2Bucket.getKeyAsNumber().longValue()).atZone(ZoneId.systemDefault()).toLocalDate());
                        LOGGER.debug("Production device commision date: " + Instant.ofEpochMilli(inner2Bucket.getKeyAsNumber().longValue()).atZone(ZoneId.systemDefault()).toLocalDate());
                        sumOfQuantity = ((ParsedSum) inner2Bucket.getAggregations().get("sumOfQuantity")).getValue();
                        LOGGER.debug("Sum of quantity value: " + sumOfQuantity);
                        aggregatedCertificateDtoOut2.setSumOfQuantity(sumOfQuantity.doubleValue());
                        LOGGER.debug("SubBuckets value: " + subBucket.getKeyAsString());
                        certificateDtoOutList.add(aggregatedCertificateDtoOut2);
                      }
                    }
                  }
                } else {
                  AggregatedCertificateDtoOut aggregatedCertificateDtoOut = new AggregatedCertificateDtoOut();
                  if (aggregation.getName().equals("accountNumber")) {
                    LOGGER.info("accountNumber value: " + bucket.getKeyAsNumber().longValue());
                    aggregatedCertificateDtoOut.setAccountNumber(bucket.getKeyAsNumber().longValue());
                  }
                  if (subAggregation.getName().equals("productionDeviceName")) {
                    aggregatedCertificateDtoOut.setProductionDeviceName(subBucket.getKeyAsString());
                  }
                  if (subBucket.getAggregations().getAsMap().get("sumOfQuantity") != null) {
                    sumOfQuantity = ((ParsedSum) subBucket.getAggregations().get("sumOfQuantity")).getValue();
                    aggregatedCertificateDtoOut.setSumOfQuantity(sumOfQuantity.doubleValue());
                  }
                  certificateDtoOutList.add(aggregatedCertificateDtoOut);
                }
              }
            }
          }
        }
      }
      pageInfo.setPageSize(certificateDtoOutList.size());
      pageInfo.setTotalSize(certificateDtoOutList.size());
    }

    listAggregatedCertificatesDtoOut.setCertificateDtoOutList(certificateDtoOutList);
    listAggregatedCertificatesDtoOut.setPageInfo(pageInfo);

    return listAggregatedCertificatesDtoOut;
  }