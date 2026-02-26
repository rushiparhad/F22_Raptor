"""Command-line helper for quick predictions."""
import argparse
from predict import predict_best_market, print_prediction_result


def main():
    parser = argparse.ArgumentParser(description="Quick mandi price prediction from CLI")
    parser.add_argument("--state", type=str, default="Maharashtra", help="State name")
    parser.add_argument("--district", type=str, required=True, help="District name")
    parser.add_argument("--commodity", type=str, required=True, help="Commodity name")
    args = parser.parse_args()

    result = predict_best_market(args.state, args.district, args.commodity)
    print_prediction_result(result)


if __name__ == "__main__":
    main()
