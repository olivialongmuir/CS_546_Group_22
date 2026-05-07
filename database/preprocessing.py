import json
import pandas as pd
from datetime import datetime, timezone

'''
Dataset Preprocessor

Samples and cleans up original datasets for use in project.
Only a small subset of the original dataset is necessary for testing purposes.

Datasets include:
    DOHMH_New_York_City_Restaurant_Inspection_Results_20260406.csv
    Rodent_Inspection_20260325.csv

'''

#random sampling to CSV. Called only once on massive rodents dataset
def cull_rodents(input, output, sample_size):
    df = pd.read_csv(input)
    df_cleaned = df[df['RESULT'] != 'Passed'] #we are not interested in inspections that saw no rats!
    df_sample = df_cleaned.sample(n=sample_size)
    df_sample.to_csv(output)

#random sampling to CSV. Called only once on massive restaurants dataset
def cull_restaurants(input, output, sample_size):
    df = pd.read_csv(input)
    df_sample = df.sample(n=sample_size)
    df_sample.to_csv(output)

#random sampling to json
def sample_rodent(input, output, sample_size):
    df = pd.read_csv(input)
    df_sample = df.sample(n=sample_size)
    df_sample.to_json(output, orient='records', indent=4)

#creates a smaller dataset while removing duplicates and 0 values via a filter column
def sample_restaurants(input, output, sample_size, dup_col, filter_col):
    df = pd.read_csv(input)
    df_unique = df.drop_duplicates(subset=[dup_col], keep="first")
    df_cleaned = df_unique[df_unique[filter_col].notna() & (df_unique[filter_col] != 0)]
    df_sample = df_cleaned.sample(n=sample_size)
    df_sample.to_json(output, orient='records', indent=4)

#filter and format
def process(input, output, key_map, new_keys):
    with open(input, 'r') as f:
        data = json.load(f)

    filtered_data = [
        {key_map[k]: v for k, v in record.items() if k in key_map}
        for record in data
    ] 

    for record in filtered_data:
        record.update(new_keys)

    with open(output, 'w') as f:
        json.dump(filtered_data, f, indent=4)

def main():
    original_rodents = 'Rodent_Inspection_20260325.csv'
    culled_rodents = 'rodents_inspection.csv'
    sampled_rodents = 'rodents_sample.json'
    processed_rodents = 'rodents.json'

    original_restaurants = 'DOHMH_New_York_City_Restaurant_Inspection_Results_20260406.csv'
    culled_restaurants = 'restaurants_inspection.csv'
    sampled_restaurants = 'restaurants_sample.json'
    processed_restaurants = 'restaurants.json'

    rodent_cull_size = 100000
    rodent_data_size = 100
    restaurants_cull_size = 100000
    restaurant_data_size = 20

    timestamp = datetime.now(timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z')

    rodent_map = {
        "JOB_ID": "jobId",
        "LATITUDE": "latitude",
        "LONGITUDE": "longitude",
        "RESULT": "status",
        "ZIP_CODE": "zipcode",
        "INSPECTION_DATE": "inspectionDate",
        "APPROVED_DATE": "approvedDate"
    }

    rodent_new_keys = {
        "status": "unverified",
        "restaurantId": None,
        "userId": None,
        "description": None,
        "rodent": None,
        "timestamp": timestamp,
        "updatedAt": None,
        "verifiedBy": "inspector",
        "stats": {
            "likes": 0,
            "dislikes": 0
        }
    }

    #----------------------------------------------------------------------------

    restaurants_map = {
        "CAMIS": "camis",
        "DBA": "name",
        "BORO": "boro",
        "BUILDING": "building",
        "STREET": "street",
        "ZIPCODE": "zipcode",
        "PHONE": "phone",
        "CUISINE DESCRIPTION": "type",
        "GRADE": "grade",
        "GRADE DATE": "gradeDate",
        "SCORE": "score",
        "Latitude": "latitude",
        "Longitude": "longitude",
    }

    restaurants_newKeys = {
        "status": "pending",
        "stats": {
            "likes": 0,
            "dislikes": 0
        }
    }

    #cull_rodents(input=original_rodents, output=culled_rodents, sample_size=rodent_cull_size)
    #cull_restaurants(input=original_restaurants, output=culled_restaurants, sample_size=restaurants_cull_size)
    sample_rodent(input=culled_rodents, output=sampled_rodents, sample_size=rodent_data_size)
    sample_restaurants(input=culled_restaurants, output=sampled_restaurants, sample_size=restaurant_data_size, dup_col="DBA", filter_col="Latitude")
    process(input=sampled_rodents, output=processed_rodents, key_map=rodent_map, new_keys=rodent_new_keys)
    process(input=sampled_restaurants, output=processed_restaurants, key_map=restaurants_map, new_keys=restaurants_newKeys)

if __name__ == "__main__":
    main()