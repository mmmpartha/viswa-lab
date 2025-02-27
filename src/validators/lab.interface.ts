interface TestMethod {
    method: string;
    parameters: string[];
    sampleType: string;
  }
  

export interface LabInterface {
    id: number;
    labName: string;
    location: string;
    contactPerson: string;
    contactNumber: string;
    servicesOffered: string[];
    status: string;
    testMethods: TestMethod[];
}