#include <iostream>

#include <winrt/Windows.Foundation.h>

#include <boost/uuid/uuid_generators.hpp>
#include <boost/uuid/uuid_io.hpp>

using std::cout;
using std::endl;
using winrt::Windows::Foundation::GuidHelper;

int main()
{
	try
	{
		auto guid = GuidHelper::CreateNewGuid();

		auto hstr = winrt::to_hstring(guid);
		auto str = winrt::to_string(hstr);

		cout << "[WIN] " << str << endl;
	}
	catch (const winrt::hresult_error& e)
	{
		auto message = winrt::to_string(e.message());
		cout << "[FAIL] " << e.code() << ": " << message << endl;

		cout << "Creating GUID using Boost" << endl;

		auto gen = boost::uuids::random_generator();
		auto guid = gen();

		cout << "Boost random GUID: " << guid << endl;
	}
}
