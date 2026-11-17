#!/usr/bin/env python3
"""Validate NEXUS contract examples with real JSON Schema Draft 2020-12.

Run: python scripts/validate_contracts.py
Dependency: jsonschema==4.26.0
This validates structural contracts; cryptographic signatures and authorization
MUST be tested by the future API/adapter implementation.
"""
import copy
import json
from datetime import datetime
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker
from jsonschema.exceptions import ValidationError

ROOT = Path(__file__).resolve().parents[1]
PAIRS = (
    ("application-manifest.schema.json", "pneu-mouhim.manifest.json"),
    ("event.schema.json", "stock-reconciliation.event.json"),
    ("command.schema.json", "stock-verify.command.json"),
    ("command-result.schema.json", "stock-verify.receipt.json"),
)


def load(relative: str):
    return json.loads((ROOT / relative).read_text(encoding="utf-8"))


def parse_utc(value: str):
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def main():
    for schema_name, example_name in PAIRS:
        schema = load(f"contracts/{schema_name}")
        sample = load(f"contracts/examples/{example_name}")
        Draft202012Validator.check_schema(schema)
        validator = Draft202012Validator(schema, format_checker=FormatChecker())
        validator.validate(sample)

        # A required field must not silently pass: negative-contract canary.
        invalid = copy.deepcopy(sample)
        invalid.pop(schema["required"][0])
        try:
            validator.validate(invalid)
        except ValidationError:
            pass
        else:
            raise AssertionError(f"Missing required field accepted: {example_name}")

        print(f"PASS {example_name} against {schema_name}")

    manifest = load("contracts/examples/pneu-mouhim.manifest.json")
    event = load("contracts/examples/stock-reconciliation.event.json")
    command = load("contracts/examples/stock-verify.command.json")
    receipt = load("contracts/examples/stock-verify.receipt.json")

    assert manifest["connection_status"] == "not_connected"
    assert manifest["status"] == "discovered"
    assert not manifest["data_policy"]["customer_records_allowed"]
    assert not manifest["data_policy"]["medical_records_allowed"]

    assert event["synthetic_example"] is True
    assert event["source"]["kind"] == "synthetic"
    assert event["data_classification"] == "operational_metadata_only"
    assert event["app_id"] == manifest["app_id"]

    assert command["synthetic_example"] is True
    assert receipt["synthetic_example"] is True
    assert "NOT_A_VALID_SIGNATURE" in command["signature"]
    assert "NOT_A_VALID_SIGNATURE" in receipt["signature"]
    assert command["command_id"] == receipt["command_id"]
    assert command["app_id"] == receipt["app_id"] == manifest["app_id"]
    assert command["environment"] == receipt["environment"]
    assert parse_utc(command["issued_at"]) < parse_utc(command["expires_at"])
    assert (parse_utc(command["expires_at"]) - parse_utc(command["issued_at"])).total_seconds() <= 300

    print("PASS cross-contract scope / safety checks (synthetic only)")
    print("NOTE signing, replay control, capability argument validation, and product authorization are NOT tested here")


if __name__ == "__main__":
    main()
