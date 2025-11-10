import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PayloadsService {
  constructor() {}

  processProduct(data: any, sortOrder: number) {
    const payload: any = {
      subProductId: Number(data.subProductId),
      sortOrder: sortOrder,
      usedPercent: Number(data.usedPercent),
      wastePercent: Number(data.wastePercent),
      subProductMetricCost: {
        // Cost of the Sub Product from the api
        attributeValue: Number(data.subProductMetricCost.attributeValue),
        userConversionUom: data.subProductMetricCost.userConversionUom,
      },
      subProductDensity: {
        // Density of the Sub Product from the api
        attributeValue: Number(data.subProductDensity.attributeValue),
        userConversionUom: data.subProductDensity.userConversionUom,
      },
      cost: {
        // Calculated Cost Add On  (In the UI we display cost add on as USD/mt or INR/kg. This is the numerator)
        attributeValue: Number(data.cost.attributeValue),
        userConversionUom: data.cost.userConversionUom,
      },
      weight: {
        // Calculated Weight (In the UI we display cost add on as USD/mt or INR/kg. This is the denominator)
        attributeValue: 1, // Hardcode this value to 1
        userConversionUom: 'mt',
      },
      density: {
        // Calculated average density
        attributeValue: Number(data.density.attributeValue),
        userConversionUom: data.density.userConversionUom,
      },
    };
    return payload;
  }

  processConversionType(data: any, sortOrder: number) {
    const payload: any = {
      conversionTypeId: Number(data.conversionTypeId), // id of the ConversionType (Eg Labor)
      sortOrder: sortOrder,
      cost: {
        // User entered cost (UOM is the numerator of the dropdown)
        attributeValue: Number(data.cost.attributeValue),
        userConversionUom: data.cost.userConversionUom,
      },
      weight: {
        // (1 is always hardcoded. UOM is the denominator of the dropdown)
        attributeValue: Number(data.weight.attributeValue),
        userConversionUom: data.weight.userConversionUom,
      },
    };
    return payload;
  }

  productOfProcess(data: any) {
    const payload: any = {
      cost: {
        attributeValue: Number(data.cost.attributeValue), // Total Calculated Cost . UOM is the numerator
        userConversionUom: data.cost.userConversionUom,
      },
      weight: {
        // 1 is hardcoded. UOM is the denominator
        attributeValue: 1,
        userConversionUom: 'mt',
      },
      density: {
        // Total calculated average density
        attributeValue: Number(data.density.attributeValue),
        userConversionUom: data.density.userConversionUom,
      },
      metricCost: {
        // Dont send when saving. This is calculated by the backend.
        attributeValue: Number(data.metricCost.attributeValue),
        userConversionUom: data.metricCost.userConversionUom,
      },
      netWeight: {
        // Send the same as weight.
        attributeValue: 1,
        userConversionUom: 'mt',
      },
      description: data.description, // This is the description in the text box
      isProductOfProcess: true, // This is important. Send this as true.
      productTypeId: null, // This is the product type input from the user in the popup dialog
      productCode: null,
      hsnCode: null,
      productCalculator: null,
      exportDescription: null,
      isSku: false,
      isSystem: false,
      isRawMaterial: false,
      isPackagingMaterial: false,
      isSupplies: false,
      isSaleable: false,
      isFavourite: false,
      inDraftMode: false,
      additionalCosts: [],
      packages: [],
      images: [],
      additionalExpense: null,
      productCalculatorAttributeValues: null,
      packageCalculatorTemplates: null,
      process: null,
      businessAccountId: null,
      productSubTypeId: null,
      productTemplateId: null,
      productMetaId: null
    };

    return payload;
  }

  singleProcess(
    existingProcessId: number = null,
    data: any,
    processProduct: any[],
    productOfProcess: any,
    processConversionType: any[],
    processNumber: number,
    sortOrder: number
  ) {
    const payload: any = {
      id: 153,
      ...(existingProcessId != null && { existingProcessId }),
      sortOrder,
      process: {
        ...(data.id && { id: data.id }),
        description: data.description,
        processNumber,
        isSystem: false,
        isPackageEntity: false,
        calculatorMeta: null,
        processCalculator: null,
        businessAccountId: null,
        processProduct,
        productOfProcess,
        processConversionType,
      },
    };

    return payload;
  }
}
